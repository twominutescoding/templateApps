package com.template.business.auth.controller;

import com.template.business.auth.dto.ApiResponse;
import com.template.business.auth.dto.EntityAdminDTO;
import com.template.business.auth.entity.ApplicationEntity;
import com.template.business.auth.exception.ErrorCode;
import com.template.business.auth.exception.ResourceNotFoundException;
import com.template.business.auth.repository.EntityRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.util.Date;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Controller for entity (application) administration
 */
@Slf4j
@RestController
@RequestMapping("/api/v1/admin/entities")
@RequiredArgsConstructor
public class EntityAdminController {

    private final EntityRepository entityRepository;

    /**
     * Get all entities
     */
    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<List<EntityAdminDTO>>> getAllEntities() {
        try {
            List<ApplicationEntity> entities = entityRepository.findAll();
            List<EntityAdminDTO> dtos = entities.stream()
                    .map(this::convertToDTO)
                    .collect(Collectors.toList());

            log.info("Admin {} retrieved {} entities",
                    SecurityContextHolder.getContext().getAuthentication().getName(),
                    dtos.size());

            return ResponseEntity.ok(ApiResponse.success("Entities retrieved successfully", dtos));
        } catch (Exception e) {
            log.error("Failed to retrieve entities: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Failed to retrieve entities"));
        }
    }

    /**
     * Get entity by ID
     */
    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<EntityAdminDTO>> getEntity(@PathVariable String id) {
        try {
            ApplicationEntity entity = entityRepository.findById(id)
                    .orElseThrow(() -> new ResourceNotFoundException(ErrorCode.ENTITY_NOT_FOUND, "Entity not found: " + id));

            return ResponseEntity.ok(ApiResponse.success("Entity retrieved successfully", convertToDTO(entity)));
        } catch (ResourceNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ApiResponse.error(e.getMessage()));
        } catch (Exception e) {
            log.error("Failed to retrieve entity {}: {}", id, e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Failed to retrieve entity"));
        }
    }

    /**
     * Create new entity
     */
    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<EntityAdminDTO>> createEntity(@Valid @RequestBody EntityAdminDTO dto) {
        try {
            // Check if entity already exists
            if (entityRepository.existsById(dto.getId())) {
                return ResponseEntity.status(HttpStatus.CONFLICT)
                        .body(ApiResponse.error("Entity with ID '" + dto.getId() + "' already exists"));
            }

            ApplicationEntity entity = new ApplicationEntity();
            entity.setId(dto.getId());
            entity.setName(dto.getName());
            entity.setType(dto.getType());
            entity.setDescription(dto.getDescription());
            entity.setCreateDate(new Date());
            entity.setCreateUser(SecurityContextHolder.getContext().getAuthentication().getName());

            ApplicationEntity saved = entityRepository.save(entity);

            log.info("Admin {} created entity: {}",
                    SecurityContextHolder.getContext().getAuthentication().getName(),
                    saved.getId());

            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(ApiResponse.success("Entity created successfully", convertToDTO(saved)));
        } catch (Exception e) {
            log.error("Failed to create entity: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Failed to create entity: " + e.getMessage()));
        }
    }

    /**
     * Update entity
     */
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<EntityAdminDTO>> updateEntity(
            @PathVariable String id,
            @Valid @RequestBody EntityAdminDTO dto) {
        try {
            ApplicationEntity entity = entityRepository.findById(id)
                    .orElseThrow(() -> new ResourceNotFoundException(ErrorCode.ENTITY_NOT_FOUND, "Entity not found: " + id));

            entity.setName(dto.getName());
            entity.setType(dto.getType());
            entity.setDescription(dto.getDescription());

            ApplicationEntity updated = entityRepository.save(entity);

            log.info("Admin {} updated entity: {}",
                    SecurityContextHolder.getContext().getAuthentication().getName(),
                    id);

            return ResponseEntity.ok(ApiResponse.success("Entity updated successfully", convertToDTO(updated)));
        } catch (ResourceNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ApiResponse.error(e.getMessage()));
        } catch (Exception e) {
            log.error("Failed to update entity {}: {}", id, e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Failed to update entity"));
        }
    }

    /**
     * Delete entity
     */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<String>> deleteEntity(@PathVariable String id) {
        try {
            ApplicationEntity entity = entityRepository.findById(id)
                    .orElseThrow(() -> new ResourceNotFoundException(ErrorCode.ENTITY_NOT_FOUND, "Entity not found: " + id));

            // Check if entity has associated roles (optional - you might want to prevent deletion)
            if (entity.getRoles() != null && !entity.getRoles().isEmpty()) {
                return ResponseEntity.status(HttpStatus.CONFLICT)
                        .body(ApiResponse.error("Cannot delete entity with associated roles"));
            }

            entityRepository.delete(entity);

            log.info("Admin {} deleted entity: {}",
                    SecurityContextHolder.getContext().getAuthentication().getName(),
                    id);

            return ResponseEntity.ok(ApiResponse.success("Entity deleted successfully", "success"));
        } catch (ResourceNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ApiResponse.error(e.getMessage()));
        } catch (Exception e) {
            log.error("Failed to delete entity {}: {}", id, e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Failed to delete entity"));
        }
    }

    /**
     * Convert entity to DTO
     */
    private EntityAdminDTO convertToDTO(ApplicationEntity entity) {
        return EntityAdminDTO.builder()
                .id(entity.getId())
                .name(entity.getName())
                .type(entity.getType())
                .description(entity.getDescription())
                .createDate(entity.getCreateDate())
                .createUser(entity.getCreateUser())
                .build();
    }
}
