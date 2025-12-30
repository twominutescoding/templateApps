package com.template.business.service;

import com.template.business.dto.ExternalAuthResponse;
import com.template.business.dto.LoginRequest;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

/**
 * Service for calling external authentication API
 */
@Slf4j
@Service
@ConditionalOnProperty(name = "auth.external.enabled", havingValue = "true")
public class ExternalAuthService {

    @Value("${auth.external.url}")
    private String authServiceUrl;

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
                    throw new RuntimeException("Authentication failed: " + authResponse.getMessage());
                }
            } else {
                log.error("External auth service returned non-OK status: {}", response.getStatusCode());
                throw new RuntimeException("Authentication failed");
            }

        } catch (Exception e) {
            log.error("Error calling external auth service: {}", e.getMessage());
            throw new RuntimeException("Authentication service unavailable: " + e.getMessage(), e);
        }
    }
}
