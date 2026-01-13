package com.template.business.auth.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO for creating new role (admin)
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RoleCreateRequest {

    @NotBlank(message = "Role name is required")
    private String role;

    @NotBlank(message = "Entity is required")
    private String entity;

    @NotBlank(message = "Role level is required")
    private String roleLevel;

    private String description;
}
