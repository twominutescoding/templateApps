package com.template.business.auth.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Date;

/**
 * DTO for creating application logs from other backend services
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AppLogCreateRequest {

    private String entityName; // Entity name - will be resolved to entity ID

    private String module;

    private String request;

    private String response;

    @NotBlank(message = "Status is required")
    private String status; // Must match a value in D_LOG_STATUS

    private Date startTime;

    private Date endTime;

    private String notifiable; // Y/N - default N

    // Note: username is automatically populated from the authenticated user (JWT token)

    @NotBlank(message = "Create user is required")
    private String createUser; // System/service that created the log
}
