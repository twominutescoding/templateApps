package com.template.business.auth.service;

import com.template.business.auth.dto.RefreshTokenResponse;
import com.template.business.auth.dto.SessionDTO;
import com.template.business.auth.entity.RefreshToken;
import com.template.business.auth.entity.User;
import com.template.business.auth.entity.UserRole;
import com.template.business.auth.exception.CustomAuthenticationException;
import com.template.business.auth.exception.CustomAuthorizationException;
import com.template.business.auth.exception.ErrorCode;
import com.template.business.auth.exception.InternalApiException;
import com.template.business.auth.exception.ResourceNotFoundException;
import com.template.business.auth.repository.RefreshTokenRepository;
import com.template.business.auth.security.JwtUtil;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.*;
import java.util.stream.Collectors;

/**
 * Service for managing refresh tokens and user sessions.
 *
 * <p>Handles:
 * <ul>
 *   <li>Creating and storing refresh tokens</li>
 *   <li>Validating and rotating refresh tokens</li>
 *   <li>Session tracking and management</li>
 *   <li>Security monitoring (IP, device, location)</li>
 * </ul>
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class RefreshTokenService {

    private final RefreshTokenRepository refreshTokenRepository;
    private final DatabaseUserDetailsService databaseUserDetailsService;
    private final JwtUtil jwtUtil;

    @Value("${jwt.refresh.expiration:604800000}") // 7 days default
    private Long refreshTokenExpiration;

    @Value("${jwt.access.expiration:900000}") // 15 minutes default
    private Long accessTokenExpiration;

    @Value("${session.max-per-user:5}") // Max 5 sessions per user
    private int maxSessionsPerUser;

    /**
     * Creates a new refresh token for a user session
     *
     * @param username the username
     * @param entity the application/entity code
     * @param request HTTP request for extracting IP and user agent
     * @param creationType LOGIN or REFRESH
     * @return the plain refresh token (UUID format)
     */
    @Transactional
    public String createRefreshToken(String username, String entity, HttpServletRequest request, String creationType) {
        // Generate random UUID as refresh token
        String tokenValue = UUID.randomUUID().toString();

        // Hash the token before storing (SHA-256)
        String tokenHash = hashToken(tokenValue);

        // Check if user has too many active sessions
        Date now = new Date();
        long activeCount = refreshTokenRepository.countActiveTokensByUsernameAndEntity(username, entity, now);

        if (activeCount >= maxSessionsPerUser) {
            // Auto-revoke oldest session
            List<RefreshToken> oldestTokens = refreshTokenRepository
                .findOldestTokensByUsernameAndEntity(username, entity, now);

            if (!oldestTokens.isEmpty()) {
                RefreshToken oldest = oldestTokens.get(0);
                oldest.revoke();
                refreshTokenRepository.save(oldest);
                log.info("Auto-revoked oldest session for user {} (session limit reached)", username);
            }
        }

        // Create refresh token entity
        RefreshToken refreshToken = new RefreshToken();
        refreshToken.setTokenHash(tokenHash);
        refreshToken.setUsername(username);
        refreshToken.setEntity(entity);
        refreshToken.setExpiresAt(new Date(System.currentTimeMillis() + refreshTokenExpiration));
        refreshToken.setRevoked(false);
        refreshToken.setCreationType(creationType); // LOGIN or REFRESH

        // Extract request metadata
        refreshToken.setIpAddress(getClientIp(request));
        refreshToken.setUserAgent(getUserAgent(request));
        refreshToken.setDeviceName(parseDeviceName(getUserAgent(request)));

        // Save to database
        refreshTokenRepository.save(refreshToken);

        log.info("Created refresh token for user: {} entity: {} from IP: {}",
                username, entity, refreshToken.getIpAddress());

        // Return the plain token (not the hash!)
        return tokenValue;
    }

    /**
     * Refresh access token using a refresh token
     * Implements token rotation: old refresh token is revoked, new one issued
     *
     * @param refreshTokenValue the refresh token from client
     * @return RefreshTokenResponse with new access token and refresh token
     * @throws CustomAuthenticationException if token is invalid or expired
     * @throws ResourceNotFoundException if user is not found
     */
    @Transactional
    public RefreshTokenResponse refreshAccessToken(String refreshTokenValue, HttpServletRequest request) {
        // Hash the provided token to look it up
        String tokenHash = hashToken(refreshTokenValue);

        // Find token in database
        RefreshToken refreshToken = refreshTokenRepository.findByTokenHash(tokenHash)
                .orElseThrow(() -> new CustomAuthenticationException(ErrorCode.INVALID_REFRESH_TOKEN));

        // Validate token
        if (!refreshToken.isValid()) {
            throw new CustomAuthenticationException(
                    ErrorCode.INVALID_REFRESH_TOKEN,
                    "Refresh token is expired or revoked"
            );
        }

        // Update last used timestamp
        refreshToken.updateLastUsed();
        refreshTokenRepository.save(refreshToken);

        // Get user details and roles
        User user = databaseUserDetailsService.getUserByUsername(refreshToken.getUsername());
        if (user == null) {
            throw new ResourceNotFoundException(ErrorCode.USER_NOT_FOUND);
        }

        // SECURITY: Validate user status - reject if user is not ACTIVE
        if (!"ACTIVE".equals(user.getStatus())) {
            throw new CustomAuthenticationException(
                    ErrorCode.AUTHENTICATION_ERROR,
                    "User account is not active"
            );
        }

        // Extract roles for the entity
        List<String> roles = user.getUserRoles().stream()
                .filter(ur -> "ACTIVE".equals(ur.getStatus()))
                .filter(ur -> refreshToken.getEntity().equals(ur.getId().getEntity()))
                .map(ur -> ur.getId().getRole())
                .distinct()
                .collect(Collectors.toList());

        // Generate new access token (short-lived)
        String newAccessToken = jwtUtil.generateToken(refreshToken.getUsername(), roles);

        // TOKEN ROTATION: Revoke old refresh token and create new one
        refreshToken.revoke();
        refreshTokenRepository.save(refreshToken);

        String newRefreshToken = createRefreshToken(
                refreshToken.getUsername(),
                refreshToken.getEntity(),
                request,
                "REFRESH" // This is a token rotation, not a new login
        );

        log.info("Refreshed access token for user: {} entity: {}",
                refreshToken.getUsername(), refreshToken.getEntity());

        return RefreshTokenResponse.builder()
                .accessToken(newAccessToken)
                .refreshToken(newRefreshToken)
                .type("Bearer")
                .username(refreshToken.getUsername())
                .roles(roles)
                .theme(user.getTheme() != null ? user.getTheme() : "light")
                .paletteId(user.getPaletteId() != null ? user.getPaletteId() : "ocean-blue")
                .build();
    }

    /**
     * Revoke a specific refresh token (logout)
     *
     * @param refreshTokenValue the refresh token to revoke
     */
    @Transactional
    public void revokeRefreshToken(String refreshTokenValue) {
        String tokenHash = hashToken(refreshTokenValue);
        refreshTokenRepository.revokeTokenByHash(tokenHash, new Date());
        log.info("Revoked refresh token");
    }

    /**
     * Revoke all refresh tokens for a user (logout all devices)
     *
     * @param username the username
     */
    @Transactional
    public void revokeAllUserTokens(String username) {
        int count = refreshTokenRepository.revokeAllTokensByUsername(username, new Date());
        log.info("Revoked {} tokens for user: {}", count, username);
    }

    /**
     * Revoke all tokens for a user and specific entity
     *
     * @param username the username
     * @param entity the entity code
     */
    @Transactional
    public void revokeAllUserEntityTokens(String username, String entity) {
        int count = refreshTokenRepository.revokeAllTokensByUsernameAndEntity(username, entity, new Date());
        log.info("Revoked {} tokens for user: {} entity: {}", count, username, entity);
    }

    /**
     * Get all active sessions for a user
     *
     * @param username the username
     * @param currentTokenValue the current refresh token (to mark as current)
     * @return list of active sessions
     */
    public List<SessionDTO> getActiveSessions(String username, String currentTokenValue) {
        Date now = new Date();
        List<RefreshToken> activeTokens = refreshTokenRepository.findActiveTokensByUsername(username, now);

        String currentTokenHash = currentTokenValue != null ? hashToken(currentTokenValue) : null;

        return activeTokens.stream()
                .map(token -> SessionDTO.builder()
                        .sessionId(token.getId())
                        .username(token.getUsername())
                        .entity(token.getEntity())
                        .deviceName(token.getDeviceName())
                        .ipAddress(token.getIpAddress())
                        .location(token.getLocation())
                        .userAgent(token.getUserAgent())
                        .createdAt(token.getCreateDate())
                        .lastUsedAt(token.getLastUsedAt())
                        .expiresAt(token.getExpiresAt())
                        .current(token.getTokenHash().equals(currentTokenHash))
                        .revoked(token.getRevoked())
                        .build())
                .collect(Collectors.toList());
    }

    /**
     * Get all active sessions for a user and entity
     *
     * @param username the username
     * @param entity the entity code
     * @return list of active sessions
     */
    public List<SessionDTO> getActiveSessionsByEntity(String username, String entity) {
        Date now = new Date();
        List<RefreshToken> activeTokens = refreshTokenRepository
                .findActiveTokensByUsernameAndEntity(username, entity, now);

        return activeTokens.stream()
                .map(token -> SessionDTO.builder()
                        .sessionId(token.getId())
                        .username(token.getUsername())
                        .entity(token.getEntity())
                        .deviceName(token.getDeviceName())
                        .ipAddress(token.getIpAddress())
                        .location(token.getLocation())
                        .userAgent(token.getUserAgent())
                        .createdAt(token.getCreateDate())
                        .lastUsedAt(token.getLastUsedAt())
                        .expiresAt(token.getExpiresAt())
                        .current(false)
                        .revoked(token.getRevoked())
                        .build())
                .collect(Collectors.toList());
    }

    /**
     * Get all active sessions across all users (ADMIN only)
     *
     * @return list of all active sessions
     */
    public List<SessionDTO> getAllActiveSessions() {
        Date now = new Date();
        List<RefreshToken> activeTokens = refreshTokenRepository.findAllActiveTokens(now);

        return activeTokens.stream()
                .map(token -> SessionDTO.builder()
                        .sessionId(token.getId())
                        .username(token.getUsername())
                        .entity(token.getEntity())
                        .deviceName(token.getDeviceName())
                        .ipAddress(token.getIpAddress())
                        .location(token.getLocation())
                        .userAgent(token.getUserAgent())
                        .createdAt(token.getCreateDate())
                        .lastUsedAt(token.getLastUsedAt())
                        .expiresAt(token.getExpiresAt())
                        .current(false)
                        .revoked(token.getRevoked())
                        .build())
                .collect(Collectors.toList());
    }

    /**
     * Revoke a specific session by ID
     * Only allows users to revoke their own sessions
     *
     * @param sessionId the session ID
     * @param username the username (for security check)
     * @throws ResourceNotFoundException if session is not found
     * @throws CustomAuthorizationException if user tries to revoke another user's session
     */
    @Transactional
    public void revokeSession(Long sessionId, String username) {
        RefreshToken token = refreshTokenRepository.findById(sessionId)
                .orElseThrow(() -> new ResourceNotFoundException(ErrorCode.SESSION_NOT_FOUND));

        // Security check: user can only revoke their own sessions
        if (!token.getUsername().equals(username)) {
            throw new CustomAuthorizationException(ErrorCode.UNAUTHORIZED_SESSION_ACCESS);
        }

        token.revoke();
        refreshTokenRepository.save(token);

        log.info("Revoked session {} for user: {}", sessionId, username);
    }

    /**
     * Revoke any session by ID (ADMIN only)
     * Admins can revoke any user's session
     *
     * @param sessionId the session ID
     * @throws ResourceNotFoundException if session is not found
     */
    @Transactional
    public void revokeSessionByAdmin(Long sessionId) {
        RefreshToken token = refreshTokenRepository.findById(sessionId)
                .orElseThrow(() -> new ResourceNotFoundException(ErrorCode.SESSION_NOT_FOUND));

        token.revoke();
        refreshTokenRepository.save(token);

        log.info("Admin revoked session {} for user: {}", sessionId, token.getUsername());
    }

    /**
     * Cleanup expired tokens (scheduled job)
     *
     * @return number of deleted tokens
     */
    @Transactional
    public int cleanupExpiredTokens() {
        int count = refreshTokenRepository.deleteExpiredTokens(new Date());
        if (count > 0) {
            log.info("Cleaned up {} expired refresh tokens", count);
        }
        return count;
    }

    /**
     * Cleanup old revoked tokens (scheduled job)
     * Deletes revoked tokens older than 30 days
     *
     * @return number of deleted tokens
     */
    @Transactional
    public int cleanupOldRevokedTokens() {
        Calendar cal = Calendar.getInstance();
        cal.add(Calendar.DAY_OF_MONTH, -30); // 30 days ago
        Date cutoffDate = cal.getTime();

        int count = refreshTokenRepository.deleteRevokedTokensOlderThan(cutoffDate);
        if (count > 0) {
            log.info("Cleaned up {} old revoked tokens", count);
        }
        return count;
    }

    /**
     * Hash a token using SHA-256
     * Security: never store plain tokens in database
     *
     * @throws InternalApiException if SHA-256 algorithm is not available
     */
    private String hashToken(String token) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(token.getBytes(StandardCharsets.UTF_8));
            return bytesToHex(hash);
        } catch (NoSuchAlgorithmException e) {
            throw new InternalApiException(
                    ErrorCode.INTERNAL_SERVER_ERROR,
                    "SHA-256 algorithm not found",
                    e
            );
        }
    }

    /**
     * Convert byte array to hex string
     */
    private String bytesToHex(byte[] hash) {
        StringBuilder hexString = new StringBuilder(2 * hash.length);
        for (byte b : hash) {
            String hex = Integer.toHexString(0xff & b);
            if (hex.length() == 1) {
                hexString.append('0');
            }
            hexString.append(hex);
        }
        return hexString.toString();
    }

    /**
     * Extract client IP address from request
     * Handles X-Forwarded-For header for proxied requests
     */
    private String getClientIp(HttpServletRequest request) {
        String xForwardedFor = request.getHeader("X-Forwarded-For");
        if (xForwardedFor != null && !xForwardedFor.isEmpty()) {
            return xForwardedFor.split(",")[0].trim();
        }
        return request.getRemoteAddr();
    }

    /**
     * Extract user agent from request
     */
    private String getUserAgent(HttpServletRequest request) {
        String userAgent = request.getHeader("User-Agent");
        return userAgent != null && userAgent.length() > 500
                ? userAgent.substring(0, 500)
                : userAgent;
    }

    /**
     * Parse device name from user agent string
     * Creates a user-friendly device name like "Chrome on Windows"
     */
    private String parseDeviceName(String userAgent) {
        if (userAgent == null) {
            return "Unknown Device";
        }

        String browser = "Unknown Browser";
        String os = "Unknown OS";

        // Detect browser
        if (userAgent.contains("Firefox")) {
            browser = "Firefox";
        } else if (userAgent.contains("Chrome") && !userAgent.contains("Edg")) {
            browser = "Chrome";
        } else if (userAgent.contains("Edg")) {
            browser = "Edge";
        } else if (userAgent.contains("Safari") && !userAgent.contains("Chrome")) {
            browser = "Safari";
        } else if (userAgent.contains("Opera") || userAgent.contains("OPR")) {
            browser = "Opera";
        }

        // Detect OS
        if (userAgent.contains("Windows")) {
            os = "Windows";
        } else if (userAgent.contains("Mac OS")) {
            os = "macOS";
        } else if (userAgent.contains("Linux")) {
            os = "Linux";
        } else if (userAgent.contains("Android")) {
            os = "Android";
        } else if (userAgent.contains("iPhone") || userAgent.contains("iPad")) {
            os = "iOS";
        }

        return browser + " on " + os;
    }
}
