package com.template.business.auth.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Date;

/**
 * DTO for entity type lookup (D_ENTITY_TYPES table)
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EntityTypeDTO {

    private String tag;
    private String type;
    private String description;
    private Date createDate;
    private String createUser;
}
