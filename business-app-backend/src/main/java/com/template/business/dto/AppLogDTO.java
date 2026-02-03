package com.template.business.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Date;

/**
 * DTO for application log responses from auth-service (read-only view).
 * Used when retrieving log entries from auth-service's logging API.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AppLogDTO {

    private Long id;
    private String entity;
    private String entityName; // Resolved entity name
    private String module;
    private String request; // May be truncated for list view
    private String response; // May be truncated for list view
    private String status;
    private Date startTime;
    private Date endTime;
    private Long durationMs; // Calculated duration in milliseconds
    private String notifiable; // Y/N
    private String notificationSent; // Y/N
    private String username;
    private String createUser;
    private Date createDate;
}
