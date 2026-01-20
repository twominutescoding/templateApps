package com.template.business.auth.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Date;

/**
 * DTO for entity (application) administration
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EntityAdminDTO {

    @NotBlank(message = "Entity ID is required")
    private String id;

    @NotBlank(message = "Entity name is required")
    private String name;

    @NotBlank(message = "Entity type is required")
    private String type;

    private String description;

    private Date createDate;

    private String createUser;
}
