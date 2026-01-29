package com.template.business.auth.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Date;

/**
 * DTO for role administration
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RoleAdminDTO {
    private String role;
    private String entity;        // Entity ID (for API operations)
    private String entityName;    // Entity Name (for display)
    private String roleLevel;
    private String description;
    private Date createDate;
    private String createUser;
    private int userCount; // Number of users with this role
}
