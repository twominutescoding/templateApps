package com.template.business.service;

import com.template.business.dto.ExternalAuthResponse;
import com.template.business.dto.LoginRequest;
import com.template.business.dto.RefreshTokenRequest;
import com.template.business.dto.ThemePreferencesRequest;
import com.template.business.exception.CustomAuthenticationException;
import com.template.business.exception.ErrorCode;
import com.template.business.exception.ExternalServiceException;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

/**
 * Service for calling external authentication API (auth-service)
 * All authentication is delegated to the external auth-service
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class ExternalAuthService {

    @Value("${auth.service.host}")
    private String authServiceHost;

    @Value("${auth.service.login-endpoint}")
    private String loginEndpoint;

    @Value("${auth.service.refresh-endpoint}")
    private String refreshEndpoint;

    @Value("${auth.service.theme-url:}")
    private String authServiceThemeUrl;

    private final RestTemplate restTemplate;

    /**
     * Authenticate with external auth-service
     *
     * @param username Username
     * @param password Password
     * @param entityCode Entity (application) code for multi-app support
     * @return ExternalAuthResponse with token and user data
     */
    public ExternalAuthResponse authenticate(String username, String password, String entityCode) {
        try {
            String authServiceUrl = authServiceHost + loginEndpoint;
            log.debug("Authenticating with external auth-service: {}", authServiceUrl);

            // Create request body
            LoginRequest loginRequest = new LoginRequest();
            loginRequest.setUsername(username);
            loginRequest.setPassword(password);
            loginRequest.setEntityCode(entityCode);

            // Create headers
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);

            // Create request entity
            HttpEntity<LoginRequest> requestEntity = new HttpEntity<>(loginRequest, headers);

            // Call external auth service
            ResponseEntity<ExternalAuthResponse> response = restTemplate.exchange(
                    authServiceUrl,
                    HttpMethod.POST,
                    requestEntity,
                    ExternalAuthResponse.class
            );

            if (response.getStatusCode() == HttpStatus.OK && response.getBody() != null) {
                ExternalAuthResponse authResponse = response.getBody();
                if (authResponse.isSuccess() && authResponse.getData() != null) {
                    log.info("Successfully authenticated user '{}' with external service", username);
                    return authResponse;
                } else {
                    log.error("External auth service returned unsuccessful response");
                    String message = authResponse.getMessage() != null ? authResponse.getMessage() : "Authentication failed";
                    throw new CustomAuthenticationException(ErrorCode.EXTERNAL_AUTH_ERROR, message);
                }
            } else {
                log.error("External auth service returned non-OK status: {}", response.getStatusCode());
                throw new CustomAuthenticationException(ErrorCode.EXTERNAL_AUTH_ERROR, "Authentication failed");
            }

        } catch (Exception e) {
            log.error("Error calling external auth service: {}", e.getMessage());
            throw new ExternalServiceException(ErrorCode.EXTERNAL_SERVICE_UNAVAILABLE, "Authentication service unavailable: " + e.getMessage(), e);
        }
    }

    /**
     * Refresh token with external auth-service
     *
     * @param refreshToken Refresh token string
     * @return ExternalAuthResponse with new token and user data
     */
    public ExternalAuthResponse refreshToken(String refreshToken) {
        try {
            String authServiceRefreshUrl = authServiceHost + refreshEndpoint;
            log.debug("Refreshing token with external auth-service: {}", authServiceRefreshUrl);

            // Create request body
            RefreshTokenRequest request = new RefreshTokenRequest();
            request.setRefreshToken(refreshToken);

            // Create headers
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);

            // Create request entity
            HttpEntity<RefreshTokenRequest> requestEntity = new HttpEntity<>(request, headers);

            // Call external auth service refresh endpoint
            ResponseEntity<ExternalAuthResponse> response = restTemplate.exchange(
                    authServiceRefreshUrl,
                    HttpMethod.POST,
                    requestEntity,
                    ExternalAuthResponse.class
            );

            if (response.getStatusCode() == HttpStatus.OK && response.getBody() != null) {
                ExternalAuthResponse authResponse = response.getBody();
                if (authResponse.isSuccess() && authResponse.getData() != null) {
                    log.info("Successfully refreshed token with external service for user: {}",
                            authResponse.getData().getUsername());
                    log.debug("Refresh response - token present: {}, refreshToken present: {}",
                            authResponse.getData().getToken() != null,
                            authResponse.getData().getRefreshToken() != null);
                    return authResponse;
                } else {
                    log.error("External auth service returned unsuccessful response on refresh");
                    String message = authResponse.getMessage() != null ? authResponse.getMessage() : "Token refresh failed";
                    throw new CustomAuthenticationException(ErrorCode.TOKEN_EXPIRED, message);
                }
            } else {
                log.error("External auth service returned non-OK status on refresh: {}", response.getStatusCode());
                throw new CustomAuthenticationException(ErrorCode.TOKEN_EXPIRED, "Token refresh failed");
            }

        } catch (Exception e) {
            log.error("Error calling external auth service for token refresh: {}", e.getMessage());
            throw new ExternalServiceException(ErrorCode.EXTERNAL_SERVICE_UNAVAILABLE, "Auth service unavailable for token refresh: " + e.getMessage(), e);
        }
    }

    /**
     * Update user's theme preferences with external auth-service
     *
     * @param theme Theme mode (light/dark)
     * @param paletteId Palette ID
     */
    public void updateThemePreferences(String theme, String paletteId) {
        try {
            // Get the theme URL - derive from auth service login endpoint if not explicitly set
            String themeUrl = authServiceThemeUrl;
            if (themeUrl == null || themeUrl.isEmpty()) {
                // Derive from login URL: replace /login with /theme
                themeUrl = authServiceHost + loginEndpoint.replace("/login", "/theme");
            }

            log.debug("Updating theme preferences with external auth-service: {}", themeUrl);

            // Get the current request to extract the Authorization header
            ServletRequestAttributes attributes = (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();
            if (attributes == null) {
                throw new ExternalServiceException(ErrorCode.EXTERNAL_SERVICE_UNAVAILABLE, "No request context available", null);
            }

            HttpServletRequest currentRequest = attributes.getRequest();
            String authHeader = currentRequest.getHeader("Authorization");

            if (authHeader == null || !authHeader.startsWith("Bearer ")) {
                throw new CustomAuthenticationException(ErrorCode.INVALID_TOKEN, "No valid authorization token found");
            }

            // Create request body
            ThemePreferencesRequest request = new ThemePreferencesRequest();
            request.setTheme(theme);
            request.setPaletteId(paletteId);

            // Create headers with authorization
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.set("Authorization", authHeader);

            // Create request entity
            HttpEntity<ThemePreferencesRequest> requestEntity = new HttpEntity<>(request, headers);

            // Call external auth service theme endpoint
            ResponseEntity<Void> response = restTemplate.exchange(
                    themeUrl,
                    HttpMethod.PUT,
                    requestEntity,
                    Void.class
            );

            if (response.getStatusCode() == HttpStatus.OK) {
                log.info("Successfully updated theme preferences with external service");
            } else {
                log.error("External auth service returned non-OK status on theme update: {}", response.getStatusCode());
                throw new ExternalServiceException(ErrorCode.EXTERNAL_SERVICE_UNAVAILABLE, "Theme update failed", null);
            }

        } catch (CustomAuthenticationException e) {
            throw e;
        } catch (Exception e) {
            log.error("Error calling external auth service for theme update: {}", e.getMessage());
            throw new ExternalServiceException(ErrorCode.EXTERNAL_SERVICE_UNAVAILABLE, "Auth service unavailable for theme update: " + e.getMessage(), e);
        }
    }
}
