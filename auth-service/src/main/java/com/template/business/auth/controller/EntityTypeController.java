package com.template.business.auth.controller;

import com.template.business.auth.dto.ApiResponse;
import com.template.business.auth.dto.EntityTypeDTO;
import com.template.business.auth.entity.EntityType;
import com.template.business.auth.repository.EntityTypeRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;

import java.util.List;
import java.util.stream.Collectors;

/**
 * REST controller for entity type lookup operations.
 *
 * <p>Entity types define categories of entities with a 3-character tag
 * used for ID generation (e.g., "APP" for applications).
 *
 * @author Template Business
 * @version 1.0
 */
@Slf4j
@RestController
@RequestMapping("/api/v1/admin/entity-types")
@RequiredArgsConstructor
@Tag(name = "Entity Types", description = "Entity type lookup operations. Entity types define categories with ID generation tags.")
public class EntityTypeController {

    private final EntityTypeRepository entityTypeRepository;

    /**
     * Get all entity types
     */
    @Operation(
        summary = "Get all entity types",
        description = "Returns all entity types for dropdown/selection. Requires ADMIN role.",
        security = @SecurityRequirement(name = "bearerAuth")
    )
    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<List<EntityTypeDTO>>> getAllEntityTypes() {
        try {
            List<EntityType> entityTypes = entityTypeRepository.findAll();
            List<EntityTypeDTO> dtos = entityTypes.stream()
                    .map(this::convertToDTO)
                    .collect(Collectors.toList());

            log.info("Retrieved {} entity types", dtos.size());

            return ResponseEntity.ok(ApiResponse.success("Entity types retrieved successfully", dtos));
        } catch (Exception e) {
            log.error("Failed to retrieve entity types: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Failed to retrieve entity types"));
        }
    }

    /**
     * Convert entity to DTO
     */
    private EntityTypeDTO convertToDTO(EntityType entityType) {
        return EntityTypeDTO.builder()
                .tag(entityType.getTag())
                .type(entityType.getType())
                .description(entityType.getDescription())
                .createDate(entityType.getCreateDate())
                .createUser(entityType.getCreateUser())
                .build();
    }
}
