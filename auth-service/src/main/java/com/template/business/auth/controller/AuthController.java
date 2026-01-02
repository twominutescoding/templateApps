package com.template.business.auth.controller;

import com.template.business.auth.dto.*;
import com.template.business.auth.entity.User;
import com.template.business.auth.entity.UserRole;
import com.template.business.auth.security.CustomAuthenticationProvider;
import com.template.business.auth.security.JwtUtil;
import com.template.business.auth.service.DatabaseUserDetailsService;
import com.template.business.auth.service.RefreshTokenService;
import com.template.business.auth.service.UserService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

/**
 * REST controller for authentication and user management operations.
 *
 * <p>This controller handles:
 * <ul>
 *   <li>User login with JWT token generation</li>
 *   <li>User registration</li>
 *   <li>JWT token validation</li>
 *   <li>Health check endpoint</li>
 * </ul>
 *
 * <p>Authentication is performed via {@link CustomAuthenticationProvider} which supports
 * both LDAP (Active Directory) and database-based authentication. Roles are always loaded
 * from the database regardless of authentication method.
 *
 * @author Template Business
 * @version 1.0
 * @see CustomAuthenticationProvider
 * @see JwtUtil
 */
@Slf4j
@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
public class AuthController {

    private final CustomAuthenticationProvider authenticationProvider;
    private final DatabaseUserDetailsService databaseUserDetailsService;
    private final UserService userService;
    private final JwtUtil jwtUtil;
    private final RefreshTokenService refreshTokenService;

    @Value("${ldap.enabled}")
    private boolean ldapEnabled;

    /**
     * Authenticates a user and returns a JWT token.
     *
     * <p>Authentication flow:
     * <ol>
     *   <li>Attempts LDAP authentication if enabled</li>
     *   <li>Falls back to database authentication if LDAP fails or is disabled</li>
     *   <li>Loads user details and roles from database</li>
     *   <li>Generates JWT token with roles</li>
     *   <li>Returns complete user profile with authentication method indicator</li>
     * </ol>
     *
     * @param request login credentials containing username, password, and optional entityCode
     * @return {@link ApiResponse} containing {@link LoginResponse} with JWT token and user data
     */
    @PostMapping("/login")
    public ResponseEntity<ApiResponse<LoginResponse>> login(
            @Valid @RequestBody LoginRequest request,
            HttpServletRequest httpRequest) {
        try {
            log.info("Login attempt for user: {}", request.getUsername());

            // Authenticate using custom provider (LDAP + DB fallback)
            Authentication authentication = authenticationProvider.authenticate(
                new UsernamePasswordAuthenticationToken(request.getUsername(), request.getPassword())
            );

            // Determine which authentication method was used
            // The authentication object's details contain info about the auth method
            String authMethod = determineAuthMethod(authentication);

            // Get user details from database (needed for response and roles)
            User user = databaseUserDetailsService.getUserByUsername(request.getUsername());

            // Extract roles - prioritize database roles if user exists
            List<String> roles;

            if (user != null && user.getUserRoles() != null && !user.getUserRoles().isEmpty()) {
                // LDAP is only for authentication - roles ALWAYS come from database
                if (request.getEntityCode() != null) {
                    // Filter roles by specific entity
                    roles = user.getUserRoles().stream()
                            .filter(ur -> "ACTIVE".equals(ur.getStatus()))
                            .filter(ur -> request.getEntityCode().equals(ur.getId().getEntity()))
                            .map(ur -> ur.getId().getRole())
                            .distinct()
                            .collect(Collectors.toList());
                } else {
                    // Return all active roles from all entities
                    roles = user.getUserRoles().stream()
                            .filter(ur -> "ACTIVE".equals(ur.getStatus()))
                            .map(ur -> ur.getId().getRole())
                            .distinct()
                            .collect(Collectors.toList());
                }
            } else {
                // Fallback to authentication authorities (only if user not in database)
                roles = authentication.getAuthorities().stream()
                        .map(GrantedAuthority::getAuthority)
                        .collect(Collectors.toList());
            }

            // Generate JWT access token (short-lived)
            String accessToken = jwtUtil.generateToken(request.getUsername(), roles);

            // Generate refresh token (long-lived) and store in database
            String entityCode = request.getEntityCode() != null ? request.getEntityCode() : "DEFAULT";
            String refreshToken = refreshTokenService.createRefreshToken(
                    request.getUsername(),
                    entityCode,
                    httpRequest
            );

            // Build response - ALWAYS include all user data from database (if available)
            LoginResponse.LoginResponseBuilder responseBuilder = LoginResponse.builder()
                    .token(accessToken)
                    .refreshToken(refreshToken)
                    .type("Bearer")
                    .username(request.getUsername())
                    .roles(roles)
                    .authenticationMethod(authMethod);

            // Add user details from database (for both LDAP and DATABASE auth)
            if (user != null) {
                responseBuilder
                        .email(user.getEmail())
                        .firstName(user.getFirstName())
                        .lastName(user.getLastName())
                        .company(user.getCompany())
                        .theme(user.getTheme())
                        .image(user.getImage());
            }

            LoginResponse loginResponse = responseBuilder.build();

            log.info("User {} logged in successfully via {} - Data source: {}",
                    request.getUsername(),
                    authMethod,
                    user != null ? "DATABASE" : "AUTHENTICATION_PROVIDER");

            return ResponseEntity.ok(ApiResponse.success("Login successful", loginResponse));

        } catch (Exception e) {
            log.error("Login failed for user {}: {}", request.getUsername(), e.getMessage());
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(ApiResponse.error("Invalid username or password"));
        }
    }

    /**
     * Registers a new user in the system.
     *
     * <p>Creates a new user account with BCrypt password encryption.
     * User status is set to ACTIVE by default.
     *
     * @param request registration details including username, password, and profile information
     * @return {@link ApiResponse} containing the created {@link User} object
     */
    @PostMapping("/register")
    public ResponseEntity<ApiResponse<User>> register(@Valid @RequestBody UserRegistrationRequest request) {
        try {
            log.info("Registration attempt for user: {}", request.getUsername());

            if (userService.existsByUsername(request.getUsername())) {
                return ResponseEntity.status(HttpStatus.CONFLICT)
                        .body(ApiResponse.error("Username already exists"));
            }

            User user = userService.registerUser(request);
            log.info("User {} registered successfully", request.getUsername());

            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(ApiResponse.success("User registered successfully", user));

        } catch (Exception e) {
            log.error("Registration failed for user {}: {}", request.getUsername(), e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.error("Registration failed: " + e.getMessage()));
        }
    }

    /**
     * Validates a JWT token.
     *
     * <p>Extracts the token from the Authorization header and checks if it's valid
     * and not expired.
     *
     * @param authHeader the Authorization header containing the Bearer token
     * @return {@link ApiResponse} with boolean indicating token validity
     */
    @GetMapping("/validate")
    public ResponseEntity<ApiResponse<Boolean>> validateToken(@RequestHeader("Authorization") String authHeader) {
        try {
            if (authHeader != null && authHeader.startsWith("Bearer ")) {
                String token = authHeader.substring(7);
                boolean isValid = jwtUtil.validateToken(token);
                return ResponseEntity.ok(ApiResponse.success("Token validation result", isValid));
            }
            return ResponseEntity.ok(ApiResponse.success("Token validation result", false));
        } catch (Exception e) {
            return ResponseEntity.ok(ApiResponse.success("Token validation result", false));
        }
    }

    /**
     * Refresh access token using a refresh token.
     *
     * <p>Implements token rotation: old refresh token is revoked, new tokens issued.
     * This allows users to get new access tokens without re-entering credentials.
     *
     * @param request refresh token request
     * @param httpRequest HTTP request for extracting metadata
     * @return {@link ApiResponse} containing new access token and refresh token
     */
    @PostMapping("/refresh")
    public ResponseEntity<ApiResponse<RefreshTokenResponse>> refreshToken(
            @Valid @RequestBody RefreshTokenRequest request,
            HttpServletRequest httpRequest) {
        try {
            RefreshTokenResponse response = refreshTokenService.refreshAccessToken(
                    request.getRefreshToken(),
                    httpRequest
            );
            return ResponseEntity.ok(ApiResponse.success("Token refreshed successfully", response));
        } catch (Exception e) {
            log.error("Token refresh failed: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(ApiResponse.error("Invalid or expired refresh token"));
        }
    }

    /**
     * Logout - revoke refresh token.
     *
     * <p>Revokes the provided refresh token, preventing it from being used again.
     * The access token will remain valid until expiry (typically 15 minutes).
     *
     * @param request refresh token to revoke
     * @return {@link ApiResponse} with logout confirmation
     */
    @PostMapping("/logout")
    public ResponseEntity<ApiResponse<String>> logout(@Valid @RequestBody RefreshTokenRequest request) {
        try {
            refreshTokenService.revokeRefreshToken(request.getRefreshToken());
            return ResponseEntity.ok(ApiResponse.success("Logged out successfully", "success"));
        } catch (Exception e) {
            log.error("Logout failed: {}", e.getMessage());
            return ResponseEntity.ok(ApiResponse.success("Logged out", "success"));
        }
    }

    /**
     * Logout from all devices - revoke all refresh tokens for the current user.
     *
     * <p>Requires authentication via JWT token in Authorization header.
     * Revokes all active refresh tokens for the authenticated user.
     *
     * @param authHeader Authorization header with Bearer token
     * @return {@link ApiResponse} with logout confirmation
     */
    @PostMapping("/logout-all")
    public ResponseEntity<ApiResponse<String>> logoutAll(@RequestHeader("Authorization") String authHeader) {
        try {
            if (authHeader != null && authHeader.startsWith("Bearer ")) {
                String token = authHeader.substring(7);
                String username = jwtUtil.extractUsername(token);

                if (username != null) {
                    refreshTokenService.revokeAllUserTokens(username);
                    return ResponseEntity.ok(ApiResponse.success(
                            "Logged out from all devices successfully",
                            "success"
                    ));
                }
            }
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(ApiResponse.error("Invalid token"));
        } catch (Exception e) {
            log.error("Logout all failed: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Logout failed"));
        }
    }

    /**
     * Get all active sessions for the current user.
     *
     * <p>Returns list of all active sessions with device info, IP address, location, etc.
     * Useful for session management UI.
     *
     * @param authHeader Authorization header with Bearer token
     * @param refreshToken Optional refresh token to mark as current
     * @return {@link ApiResponse} containing list of {@link SessionDTO}
     */
    @GetMapping("/sessions")
    public ResponseEntity<ApiResponse<List<SessionDTO>>> getSessions(
            @RequestHeader("Authorization") String authHeader,
            @RequestParam(required = false) String refreshToken) {
        try {
            if (authHeader != null && authHeader.startsWith("Bearer ")) {
                String token = authHeader.substring(7);
                String username = jwtUtil.extractUsername(token);

                if (username != null) {
                    List<SessionDTO> sessions = refreshTokenService.getActiveSessions(username, refreshToken);
                    return ResponseEntity.ok(ApiResponse.success("Sessions retrieved", sessions));
                }
            }
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(ApiResponse.error("Invalid token"));
        } catch (Exception e) {
            log.error("Get sessions failed: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Failed to retrieve sessions"));
        }
    }

    /**
     * Revoke a specific session.
     *
     * <p>Allows users to revoke a specific session (e.g., "logout from iPhone").
     * Users can only revoke their own sessions.
     *
     * @param authHeader Authorization header with Bearer token
     * @param request session revocation request
     * @return {@link ApiResponse} with revocation confirmation
     */
    @PostMapping("/sessions/revoke")
    public ResponseEntity<ApiResponse<String>> revokeSession(
            @RequestHeader("Authorization") String authHeader,
            @Valid @RequestBody RevokeSessionRequest request) {
        try {
            if (authHeader != null && authHeader.startsWith("Bearer ")) {
                String token = authHeader.substring(7);
                String username = jwtUtil.extractUsername(token);

                if (username != null) {
                    refreshTokenService.revokeSession(request.getSessionId(), username);
                    return ResponseEntity.ok(ApiResponse.success("Session revoked successfully", "success"));
                }
            }
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(ApiResponse.error("Invalid token"));
        } catch (Exception e) {
            log.error("Revoke session failed: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.error(e.getMessage()));
        }
    }

    /**
     * Health check endpoint.
     *
     * <p>Returns service status and LDAP configuration state.
     * Useful for monitoring and load balancers.
     *
     * @return {@link ApiResponse} with health status message
     */
    @GetMapping("/health")
    public ResponseEntity<ApiResponse<String>> health() {
        String ldapStatus = ldapEnabled ? "enabled" : "disabled";
        return ResponseEntity.ok(ApiResponse.success(
                "Auth service is running. LDAP is " + ldapStatus,
                "healthy"
        ));
    }

    /**
     * Determine which authentication method was actually used
     * by examining the authentication object
     *
     * @param authentication The authentication object from Spring Security
     * @return "LDAP" if LDAP was used, "DATABASE" if database was used
     */
    private String determineAuthMethod(Authentication authentication) {
        // The CustomAuthenticationProvider returns different authentication types:
        // - LDAP auth returns an authentication from LdapAuthenticationProvider
        // - Database auth returns UsernamePasswordAuthenticationToken with UserDetails as principal

        // Check the principal type - if it's UserDetails from our DatabaseUserDetailsService,
        // it means database authentication was used
        Object principal = authentication.getPrincipal();
        if (principal instanceof org.springframework.security.core.userdetails.User) {
            // This is from our DatabaseUserDetailsService
            return "DATABASE";
        }

        // Check if the authentication class name contains "Ldap"
        String authClassName = authentication.getClass().getSimpleName();
        if (authClassName.contains("Ldap")) {
            return "LDAP";
        }

        // Fallback: check if LDAP is enabled - if so, assume LDAP was used
        // (since database auth would have UserDetails as principal)
        if (ldapEnabled) {
            return "LDAP";
        }

        // Default to DATABASE
        return "DATABASE";
    }
}
