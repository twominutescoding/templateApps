package com.template.business.auth.controller;

import com.template.business.auth.dto.ApiResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

/**
 * Health check endpoints for monitoring and load balancers.
 * <p>
 * Provides two endpoints:
 * <ul>
 *   <li>/health - Public endpoint, no authentication required</li>
 *   <li>/healthDB - Protected endpoint, requires Bearer token, checks database connectivity</li>
 * </ul>
 */
@Slf4j
@RestController
@RequestMapping("/api/v1")
@RequiredArgsConstructor
public class HealthController {

    private final JdbcTemplate jdbcTemplate;

    @Value("${ldap.enabled:false}")
    private boolean ldapEnabled;

    /**
     * Basic health check - public endpoint.
     * Used by load balancers and monitoring systems.
     *
     * @return Health status with timestamp
     */
    @GetMapping("/health")
    public ResponseEntity<ApiResponse<Map<String, Object>>> health() {
        Map<String, Object> healthData = new HashMap<>();
        healthData.put("status", "UP");
        healthData.put("timestamp", LocalDateTime.now().toString());
        healthData.put("service", "auth-service");
        healthData.put("ldap", ldapEnabled ? "enabled" : "disabled");

        return ResponseEntity.ok(ApiResponse.success("Service is healthy", healthData));
    }

    /**
     * Database health check - protected endpoint (requires authentication).
     * Checks database connectivity and returns detailed status.
     *
     * @return Health status including database connectivity
     */
    @GetMapping("/healthDB")
    public ResponseEntity<ApiResponse<Map<String, Object>>> healthDB() {
        Map<String, Object> healthData = new HashMap<>();
        healthData.put("status", "UP");
        healthData.put("timestamp", LocalDateTime.now().toString());
        healthData.put("service", "auth-service");
        healthData.put("ldap", ldapEnabled ? "enabled" : "disabled");

        // Check database connectivity
        Map<String, Object> dbHealth = new HashMap<>();
        try {
            long startTime = System.currentTimeMillis();
            jdbcTemplate.queryForObject("SELECT 1 FROM DUAL", Integer.class);
            long latency = System.currentTimeMillis() - startTime;

            dbHealth.put("status", "UP");
            dbHealth.put("latency_ms", latency);
            dbHealth.put("message", "Database connection successful");
        } catch (Exception e) {
            log.error("Database health check failed: {}", e.getMessage());
            dbHealth.put("status", "DOWN");
            dbHealth.put("error", e.getMessage());
            healthData.put("status", "DEGRADED");
        }

        healthData.put("database", dbHealth);

        String status = (String) healthData.get("status");
        if ("DEGRADED".equals(status)) {
            return ResponseEntity.ok(ApiResponse.success("Service is degraded - database issue", healthData));
        }

        return ResponseEntity.ok(ApiResponse.success("Service and database are healthy", healthData));
    }
}
