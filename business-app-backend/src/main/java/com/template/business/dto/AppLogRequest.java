package com.template.business.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Date;

/**
 * DTO for sending log entries to auth-service's logging API.
 * Matches auth-service's AppLogCreateRequest structure.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AppLogRequest {

    /**
     * Entity name - will be resolved to entity ID by auth-service.
     * Must exist in auth-service's D_ENTITIES table.
     */
    private String entityName;

    /**
     * Module/component name within the application.
     * Example: "OrderService", "PaymentGateway", "UserController"
     */
    private String module;

    /**
     * Log status. Must match a value in auth-service's D_LOG_STATUS table.
     * Common values: INFO, SUCCESS, WARNING, ERROR
     */
    private String status;

    /**
     * Request payload or log message.
     * Can be JSON string or plain text.
     */
    private String request;

    /**
     * Response payload or result.
     * Can be JSON string, error message, or plain text.
     */
    private String response;

    /**
     * Operation start time.
     * If not provided, auth-service will use current time.
     */
    private Date startTime;

    /**
     * Operation end time.
     * Used to calculate duration.
     */
    private Date endTime;

    /**
     * Whether this log should trigger notifications.
     * Values: "Y" or "N". Default: "N"
     */
    private String notifiable;

    /**
     * Service/system identifier that created the log.
     * Example: "business-app-backend", "order-service"
     */
    private String createUser;
}
