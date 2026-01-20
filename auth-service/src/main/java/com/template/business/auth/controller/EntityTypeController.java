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

import java.util.List;
import java.util.stream.Collectors;

/**
 * Controller for entity type lookup operations
 */
@Slf4j
@RestController
@RequestMapping("/api/v1/admin/entity-types")
@RequiredArgsConstructor
public class EntityTypeController {

    private final EntityTypeRepository entityTypeRepository;

    /**
     * Get all entity types
     */
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
