package com.template.business.service;

import com.template.business.dto.ExternalAuthResponse;
import com.template.business.dto.LoginRequest;
import com.template.business.dto.RefreshTokenRequest;
import com.template.business.exception.CustomAuthenticationException;
import com.template.business.exception.ErrorCode;
import com.template.business.exception.ExternalServiceException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

/**
 * Service for calling external authentication API (auth-service)
 * All authentication is delegated to the external auth-service
 */
@Slf4j
@Service
public class ExternalAuthService {

    @Value("${auth.service.url}")
    private String authServiceUrl;

    @Value("${auth.service.refresh-url:${auth.service.url}/refresh}")
    private String authServiceRefreshUrl;

    private final RestTemplate restTemplate;

    public ExternalAuthService() {
        this.restTemplate = new RestTemplate();
    }

    /**
     * Authenticate with external auth-service
     *
     * @param username Username
     * @param password Password
     * @return ExternalAuthResponse with token and user data
     */
    public ExternalAuthResponse authenticate(String username, String password) {
        try {
            log.debug("Authenticating with external auth-service: {}", authServiceUrl);

            // Create request body
            LoginRequest loginRequest = new LoginRequest();
            loginRequest.setUsername(username);
            loginRequest.setPassword(password);

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
                    throw new CustomAuthenticationException(ErrorCode.EXTERNAL_AUTH_ERROR, "Authentication failed: " + authResponse.getMessage());
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
                    log.info("Successfully refreshed token with external service");
                    return authResponse;
                } else {
                    log.error("External auth service returned unsuccessful response on refresh");
                    throw new CustomAuthenticationException(ErrorCode.TOKEN_EXPIRED, "Token refresh failed: " + authResponse.getMessage());
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
}
