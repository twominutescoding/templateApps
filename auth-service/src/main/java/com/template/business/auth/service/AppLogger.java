package com.template.business.auth.service;

import com.template.business.auth.dto.AppLogCreateRequest;
import lombok.extern.slf4j.Slf4j;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.util.Date;

/**
 * Application Logger that combines SLF4J logging with database logging.
 *
 * Usage:
 * - For console/file only: Use standard SLF4J (log.info(), log.error(), etc.)
 * - For console/file + database: Use this AppLogger service
 *
 * Features:
 * - Logs to SLF4J (console/file) synchronously
 * - Logs to database asynchronously (non-blocking)
 * - Uses configured entity name from application.properties
 * - Automatically captures authenticated username from JWT
 *
 * Example:
 * <pre>
 * {@code
 * @Service
 * public class MyService {
 *     private final AppLogger appLogger;
 *
 *     public void doSomething() {
 *         appLogger.info("MyService", "Processing started");
 *         try {
 *             // business logic
 *             appLogger.success("MyService", "Processing completed", requestJson, responseJson);
 *         } catch (Exception e) {
 *             appLogger.error("MyService", "Processing failed", requestJson, e);
 *         }
 *     }
 * }
 * }
 * </pre>
 */
@Service
@Slf4j
public class AppLogger {

    private final AppLogService appLogService;

    @Value("${app.logging.entity-name:UNKNOWN}")
    private String entityName;

    @Value("${app.logging.create-user:unknown-service}")
    private String createUser;

    @Value("${app.logging.db-enabled:true}")
    private boolean dbEnabled;

    public AppLogger(AppLogService appLogService) {
        this.appLogService = appLogService;
    }

    /**
     * Log INFO level message
     */
    public void info(String module, String message) {
        info(module, message, null, null);
    }

    /**
     * Log INFO level message with request/response
     */
    public void info(String module, String message, String request, String response) {
        Logger logger = LoggerFactory.getLogger(module);
        logger.info(message);
        logToDatabase("INFO", module, message, request, response, null);
    }

    /**
     * Log SUCCESS level message
     */
    public void success(String module, String message) {
        success(module, message, null, null);
    }

    /**
     * Log SUCCESS level message with request/response
     */
    public void success(String module, String message, String request, String response) {
        Logger logger = LoggerFactory.getLogger(module);
        logger.info("[SUCCESS] {}", message);
        logToDatabase("SUCCESS", module, message, request, response, null);
    }

    /**
     * Log WARNING level message
     */
    public void warning(String module, String message) {
        warning(module, message, null, null);
    }

    /**
     * Log WARNING level message with request/response
     */
    public void warning(String module, String message, String request, String response) {
        Logger logger = LoggerFactory.getLogger(module);
        logger.warn(message);
        logToDatabase("WARNING", module, message, request, response, null);
    }

    /**
     * Log ERROR level message
     */
    public void error(String module, String message) {
        error(module, message, null, null);
    }

    /**
     * Log ERROR level message with exception
     */
    public void error(String module, String message, Throwable throwable) {
        error(module, message, null, throwable);
    }

    /**
     * Log ERROR level message with request and exception
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
        logToDatabase("ERROR", module, message, request, response, null);
    }

    /**
     * Log with custom status
     */
    public void log(String status, String module, String message, String request, String response) {
        Logger logger = LoggerFactory.getLogger(module);
        logger.info("[{}] {}", status, message);
        logToDatabase(status, module, message, request, response, null);
    }

    /**
     * Log with custom status and timing
     */
    public void log(String status, String module, String message, String request, String response,
                    Date startTime, Date endTime) {
        Logger logger = LoggerFactory.getLogger(module);
        long duration = (startTime != null && endTime != null)
                ? endTime.getTime() - startTime.getTime()
                : 0;
        logger.info("[{}] {} ({}ms)", status, message, duration);
        logToDatabaseWithTiming(status, module, message, request, response, startTime, endTime);
    }

    /**
     * Log with notifiable flag (for alerts/notifications)
     */
    public void logNotifiable(String status, String module, String message, String request, String response) {
        Logger logger = LoggerFactory.getLogger(module);
        logger.info("[{}][NOTIFIABLE] {}", status, message);
        logToDatabase(status, module, message, request, response, "Y");
    }

    /**
     * Internal method to log to database asynchronously
     */
    private void logToDatabase(String status, String module, String message,
                               String request, String response, String notifiable) {
        if (!dbEnabled) {
            return;
        }

        try {
            AppLogCreateRequest logRequest = AppLogCreateRequest.builder()
                    .entityName(entityName)
                    .module(module)
                    .status(status)
                    .request(request != null ? request : message)
                    .response(response)
                    .notifiable(notifiable != null ? notifiable : "N")
                    .createUser(createUser)
                    .build();

            // Async - non-blocking
            appLogService.createLogAsync(logRequest);
        } catch (Exception e) {
            // Don't let logging failures affect business logic
            log.warn("Failed to log to database: {}", e.getMessage());
        }
    }

    /**
     * Internal method to log to database with timing
     */
    private void logToDatabaseWithTiming(String status, String module, String message,
                                         String request, String response,
                                         Date startTime, Date endTime) {
        if (!dbEnabled) {
            return;
        }

        try {
            AppLogCreateRequest logRequest = AppLogCreateRequest.builder()
                    .entityName(entityName)
                    .module(module)
                    .status(status)
                    .request(request != null ? request : message)
                    .response(response)
                    .startTime(startTime)
                    .endTime(endTime)
                    .notifiable("N")
                    .createUser(createUser)
                    .build();

            // Async - non-blocking
            appLogService.createLogAsync(logRequest);
        } catch (Exception e) {
            // Don't let logging failures affect business logic
            log.warn("Failed to log to database: {}", e.getMessage());
        }
    }

    /**
     * Format exception to string for logging
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
