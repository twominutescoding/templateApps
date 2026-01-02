package com.template.business.auth.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Date;

/**
 * DTO representing an active user session
 * Used for session management UI
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SessionDTO {

    private Long sessionId;
    private String username;
    private String entity;
    private String deviceName;
    private String ipAddress;
    private String location;
    private String userAgent;
    private Date createdAt;
    private Date lastUsedAt;
    private Date expiresAt;
    private boolean current; // Is this the current session?
    private boolean revoked;
}
