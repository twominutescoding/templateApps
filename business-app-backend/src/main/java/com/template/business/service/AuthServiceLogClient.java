package com.template.business.service;

import com.template.business.dto.AppLogRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.concurrent.CompletableFuture;

/**
 * REST client for sending logs to auth-service's logging API.
 * All calls are made asynchronously to avoid blocking the main thread.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class AuthServiceLogClient {

    @Value("${auth.service.host}")
    private String authServiceHost;

    @Value("${auth.service.log-endpoint}")
    private String logEndpoint;

    @Value("${app.logging.enabled:true}")
    private boolean loggingEnabled;

    private final RestTemplate restTemplate;

    /**
     * Send log entry to auth-service asynchronously.
     * Uses the current user's JWT token for authentication.
     *
     * @param logRequest The log entry to send
     * @return CompletableFuture that completes when the log is sent
     */
    @Async("appLogExecutor")
    public CompletableFuture<Void> sendLogAsync(AppLogRequest logRequest, String jwtToken) {
        if (!loggingEnabled) {
            log.trace("Remote logging is disabled, skipping log entry");
            return CompletableFuture.completedFuture(null);
        }

        try {
            // Create headers with JWT token
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);

            if (jwtToken != null && !jwtToken.isEmpty()) {
                headers.setBearerAuth(jwtToken);
            } else {
                log.warn("No JWT token available for remote logging, skipping");
                return CompletableFuture.completedFuture(null);
            }

            // Create request entity
            HttpEntity<AppLogRequest> requestEntity = new HttpEntity<>(logRequest, headers);

            // Call auth-service log endpoint
            String authServiceLogUrl = authServiceHost + logEndpoint;
            ResponseEntity<String> response = restTemplate.exchange(
                    authServiceLogUrl,
                    HttpMethod.POST,
                    requestEntity,
                    String.class
            );

            if (response.getStatusCode().is2xxSuccessful()) {
                log.trace("Successfully sent log to auth-service: module={}, status={}",
                        logRequest.getModule(), logRequest.getStatus());
            } else {
                log.warn("Auth-service returned non-success status for log: {}",
                        response.getStatusCode());
            }

        } catch (Exception e) {
            // Don't let logging failures affect business logic
            log.warn("Failed to send log to auth-service: {} - {}",
                    e.getClass().getSimpleName(), e.getMessage());
        }

        return CompletableFuture.completedFuture(null);
    }

    /**
     * Send log entry to auth-service synchronously.
     * Use sparingly - prefer async logging for better performance.
     *
     * @param logRequest The log entry to send
     * @param jwtToken JWT token for authentication
     * @return true if log was sent successfully, false otherwise
     */
    public boolean sendLogSync(AppLogRequest logRequest, String jwtToken) {
        if (!loggingEnabled) {
            log.trace("Remote logging is disabled, skipping log entry");
            return false;
        }

        try {
            // Create headers with JWT token
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);

            if (jwtToken != null && !jwtToken.isEmpty()) {
                headers.setBearerAuth(jwtToken);
            } else {
                log.warn("No JWT token available for remote logging, skipping");
                return false;
            }

            // Create request entity
            HttpEntity<AppLogRequest> requestEntity = new HttpEntity<>(logRequest, headers);

            // Call auth-service log endpoint
            String authServiceLogUrl = authServiceHost + logEndpoint;
            ResponseEntity<String> response = restTemplate.exchange(
                    authServiceLogUrl,
                    HttpMethod.POST,
                    requestEntity,
                    String.class
            );

            if (response.getStatusCode().is2xxSuccessful()) {
                log.trace("Successfully sent log to auth-service: module={}, status={}",
                        logRequest.getModule(), logRequest.getStatus());
                return true;
            } else {
                log.warn("Auth-service returned non-success status for log: {}",
                        response.getStatusCode());
                return false;
            }

        } catch (Exception e) {
            // Don't let logging failures affect business logic
            log.warn("Failed to send log to auth-service: {} - {}",
                    e.getClass().getSimpleName(), e.getMessage());
            return false;
        }
    }

    /**
     * Check if remote logging is enabled.
     */
    public boolean isLoggingEnabled() {
        return loggingEnabled;
    }
}
