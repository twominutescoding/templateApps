package com.template.business.auth.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO for assigning role to user (admin)
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserRoleAssignRequest {

    @NotBlank(message = "Role is required")
    private String role;

    @NotBlank(message = "Entity is required")
    private String entity;
}
