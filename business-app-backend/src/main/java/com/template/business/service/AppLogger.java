package com.template.business.service;

import com.template.business.dto.AppLogRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.util.Date;

/**
 * Application Logger that combines SLF4J logging with remote database logging via auth-service.
 *
 * Usage:
 * - For SLF4J only: Use standard @Slf4j annotation or LoggerFactory
 * - For SLF4J + DB logging: Use this AppLogger service
 *
 * All database logging is done asynchronously to avoid blocking the main thread.
 * If remote logging fails, it will be logged locally but won't affect business logic.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class AppLogger {

    @Value("${app.logging.entity-name:BUSINESS_APP}")
    private String entityName;

    @Value("${app.logging.create-user:business-app-backend}")
    private String createUser;

    @Value("${app.logging.enabled:true}")
    private boolean remoteLoggingEnabled;

    private final AuthServiceLogClient authServiceLogClient;

    /**
     * Log an INFO message to SLF4J and optionally to remote database.
     *
     * @param module The module/component name (e.g., "OrderService", "PaymentGateway")
     * @param message The log message
     */
    public void info(String module, String message) {
        info(module, message, null, null);
    }

    /**
     * Log an INFO message with request/response details.
     *
     * @param module The module/component name
     * @param message The log message
     * @param request Request payload or context (can be null)
     * @param response Response payload or result (can be null)
     */
    public void info(String module, String message, String request, String response) {
        Logger logger = LoggerFactory.getLogger(module);
        logger.info(message);
        logToRemote("INFO", module, message, request, response, false);
    }

    /**
     * Log a SUCCESS message to SLF4J and optionally to remote database.
     *
     * @param module The module/component name
     * @param message The log message
     */
    public void success(String module, String message) {
        success(module, message, null, null);
    }

    /**
     * Log a SUCCESS message with request/response details.
     *
     * @param module The module/component name
     * @param message The log message
     * @param request Request payload or context (can be null)
     * @param response Response payload or result (can be null)
     */
    public void success(String module, String message, String request, String response) {
        Logger logger = LoggerFactory.getLogger(module);
        logger.info("[SUCCESS] {}", message);
        logToRemote("SUCCESS", module, message, request, response, false);
    }

    /**
     * Log a WARNING message to SLF4J and optionally to remote database.
     *
     * @param module The module/component name
     * @param message The log message
     */
    public void warning(String module, String message) {
        warning(module, message, null, null);
    }

    /**
     * Log a WARNING message with request/response details.
     *
     * @param module The module/component name
     * @param message The log message
     * @param request Request payload or context (can be null)
     * @param response Response payload or result (can be null)
     */
    public void warning(String module, String message, String request, String response) {
        Logger logger = LoggerFactory.getLogger(module);
        logger.warn(message);
        logToRemote("WARNING", module, message, request, response, false);
    }

    /**
     * Log an ERROR message to SLF4J and optionally to remote database.
     *
     * @param module The module/component name
     * @param message The log message
     */
    public void error(String module, String message) {
        error(module, message, (String) null, (String) null);
    }

    /**
     * Log an ERROR message with request/response details.
     *
     * @param module The module/component name
     * @param message The log message
     * @param request Request payload or context (can be null)
     * @param response Response payload or result (can be null)
     */
    public void error(String module, String message, String request, String response) {
        Logger logger = LoggerFactory.getLogger(module);
        logger.error(message);
        logToRemote("ERROR", module, message, request, response, true);
    }

    /**
     * Log an ERROR message with exception details.
     *
     * @param module The module/component name
     * @param message The log message
     * @param throwable The exception that occurred
     */
    public void error(String module, String message, Throwable throwable) {
        error(module, message, null, throwable);
    }

    /**
     * Log an ERROR message with request and exception details.
     *
     * @param module The module/component name
     * @param message The log message
     * @param request Request payload or context (can be null)
     * @param throwable The exception that occurred
     */
    public void error(String module, String message, String request, Throwable throwable) {
        Logger logger = LoggerFactory.getLogger(module);
        if (throwable != null) {
            logger.error(message, throwable);
        } else {
            logger.error(message);
        }

        String response = null;
        if (throwable != null) {
            response = formatException(throwable);
        }
        logToRemote("ERROR", module, message, request, response, true);
    }

    /**
     * Log a custom status message to SLF4J and optionally to remote database.
     *
     * @param status The log status (must exist in auth-service D_LOG_STATUS table)
     * @param module The module/component name
     * @param message The log message
     * @param request Request payload or context (can be null)
     * @param response Response payload or result (can be null)
     */
    public void log(String status, String module, String message, String request, String response) {
        log(status, module, message, request, response, false);
    }

    /**
     * Log a custom status message with notifiable flag.
     *
     * @param status The log status (must exist in auth-service D_LOG_STATUS table)
     * @param module The module/component name
     * @param message The log message
     * @param request Request payload or context (can be null)
     * @param response Response payload or result (can be null)
     * @param notifiable Whether this log should trigger notifications
     */
    public void log(String status, String module, String message, String request, String response, boolean notifiable) {
        Logger logger = LoggerFactory.getLogger(module);

        // Log to SLF4J based on status
        switch (status.toUpperCase()) {
            case "ERROR":
                logger.error(message);
                break;
            case "WARNING":
                logger.warn(message);
                break;
            case "DEBUG":
                logger.debug(message);
                break;
            default:
                logger.info("[{}] {}", status, message);
        }

        logToRemote(status, module, message, request, response, notifiable);
    }

    /**
     * Log with custom status and timing (matches auth-service signature).
     *
     * @param status The log status
     * @param module The module/component name
     * @param message The log message
     * @param request Request payload
     * @param response Response payload
     * @param startTime Operation start time
     * @param endTime Operation end time
     */
    public void log(String status, String module, String message, String request, String response,
                    Date startTime, Date endTime) {
        Logger logger = LoggerFactory.getLogger(module);
        long duration = (startTime != null && endTime != null)
            ? endTime.getTime() - startTime.getTime()
            : 0;
        logger.info("[{}] {} ({}ms)", status, message, duration);

        logToRemoteWithTiming(status, module, message, request, response, startTime, endTime, false);
    }

    /**
     * Log with notifiable flag (for alerts/notifications).
     *
     * @param status The log status
     * @param module The module/component name
     * @param message The log message
     * @param request Request payload
     * @param response Response payload
     */
    public void logNotifiable(String status, String module, String message, String request, String response) {
        Logger logger = LoggerFactory.getLogger(module);
        logger.info("[{}][NOTIFIABLE] {}", status, message);
        logToRemote(status, module, message, request, response, true);
    }

    /**
     * Send log entry to remote auth-service asynchronously.
     */
    private void logToRemote(String status, String module, String message,
                             String request, String response, boolean notifiable) {
        logToRemoteWithTiming(status, module, message, request, response, null, null, notifiable);
    }

    /**
     * Send log entry to remote auth-service asynchronously with timing information.
     */
    private void logToRemoteWithTiming(String status, String module, String message,
                                       String request, String response,
                                       Date startTime, Date endTime, boolean notifiable) {
        if (!remoteLoggingEnabled) {
            log.trace("Remote logging is disabled");
            return;
        }

        // Get JWT token from current security context
        String jwtToken = getJwtToken();
        if (jwtToken == null) {
            log.trace("No JWT token available, skipping remote logging");
            return;
        }

        try {
            // Build log request
            AppLogRequest logRequest = AppLogRequest.builder()
                    .entityName(entityName)
                    .module(module)
                    .status(status)
                    .request(request != null ? request : message)
                    .response(response)
                    .startTime(startTime != null ? startTime : new Date())
                    .endTime(endTime != null ? endTime : new Date())
                    .notifiable(notifiable ? "Y" : "N")
                    .createUser(createUser)
                    .build();

            // Send asynchronously - fire and forget
            authServiceLogClient.sendLogAsync(logRequest, jwtToken);

        } catch (Exception e) {
            // Don't let remote logging failures affect business logic
            log.warn("Failed to queue remote log: {} - {}", e.getClass().getSimpleName(), e.getMessage());
        }
    }

    /**
     * Extract JWT token from current security context.
     *
     * @return JWT token or null if not available
     */
    private String getJwtToken() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication != null && authentication.getCredentials() != null) {
            Object credentials = authentication.getCredentials();
            if (credentials instanceof String) {
                return (String) credentials;
            }
        }
        return null;
    }

    /**
     * Check if remote logging is enabled.
     */
    public boolean isRemoteLoggingEnabled() {
        return remoteLoggingEnabled;
    }

    /**
     * Get the configured entity name.
     */
    public String getEntityName() {
        return entityName;
    }

    /**
     * Format exception to string for logging.
     * Includes class name, message, and first 5 stack trace elements.
     *
     * @param throwable The exception to format
     * @return Formatted exception string
     */
    private String formatException(Throwable throwable) {
        StringBuilder sb = new StringBuilder();
        sb.append(throwable.getClass().getName())
          .append(": ")
          .append(throwable.getMessage());

        // Add first few stack trace elements
        StackTraceElement[] stackTrace = throwable.getStackTrace();
        int maxElements = Math.min(5, stackTrace.length);
        for (int i = 0; i < maxElements; i++) {
            sb.append("\n  at ").append(stackTrace[i].toString());
        }
        if (stackTrace.length > maxElements) {
            sb.append("\n  ... ").append(stackTrace.length - maxElements).append(" more");
        }

        return sb.toString();
    }
}
