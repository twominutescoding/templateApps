package com.template.business.auth.controller;

import java.util.List;

import jakarta.validation.Valid;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import com.template.business.auth.dto.ApiResponse;
import com.template.business.auth.dto.EntityAdminDTO;
import com.template.business.auth.dto.PageResponse;
import com.template.business.auth.dto.SearchRequest;
import com.template.business.auth.exception.CustomValidationException;
import com.template.business.auth.exception.ResourceNotFoundException;
import com.template.business.auth.service.EntityAdminService;

/**
 * Controller for entity (application) administration
 */
@Slf4j
@RestController
@RequestMapping("/api/v1/admin/entities")
@PreAuthorize("hasRole('ADMIN')")
@RequiredArgsConstructor
public class EntityAdminController {

    private final EntityAdminService entityAdminService;

    /**
     * Get all entities
     */
    @GetMapping
    public ResponseEntity<ApiResponse<List<EntityAdminDTO>>> getAllEntities() {
        try {
            List<EntityAdminDTO> dtos = entityAdminService.getAllEntities();
            return ResponseEntity.ok(ApiResponse.success("Entities retrieved successfully", dtos));
        } catch (Exception e) {
            log.error("Failed to retrieve entities: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Failed to retrieve entities"));
        }
    }

    /**
     * Search entities with pagination, filtering, and sorting
     */
    @PostMapping("/search")
    public ResponseEntity<ApiResponse<PageResponse<EntityAdminDTO>>> searchEntities(@RequestBody SearchRequest request) {
        try {
            PageResponse<EntityAdminDTO> response = entityAdminService.searchEntities(request);
            return ResponseEntity.ok(ApiResponse.success("Entities retrieved successfully", response));
        } catch (Exception e) {
            log.error("Failed to search entities: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Failed to search entities"));
        }
    }

    /**
     * Get entity by ID
     */
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<EntityAdminDTO>> getEntity(@PathVariable String id) {
        try {
            EntityAdminDTO dto = entityAdminService.getEntityById(id);
            return ResponseEntity.ok(ApiResponse.success("Entity retrieved successfully", dto));
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
    public ResponseEntity<ApiResponse<EntityAdminDTO>> createEntity(@Valid @RequestBody EntityAdminDTO dto) {
        try {
            EntityAdminDTO created = entityAdminService.createEntity(dto);
            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(ApiResponse.success("Entity created successfully", created));
        } catch (CustomValidationException e) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(ApiResponse.error(e.getMessage()));
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
    public ResponseEntity<ApiResponse<EntityAdminDTO>> updateEntity(
            @PathVariable String id,
            @Valid @RequestBody EntityAdminDTO dto) {
        try {
            EntityAdminDTO updated = entityAdminService.updateEntity(id, dto);
            return ResponseEntity.ok(ApiResponse.success("Entity updated successfully", updated));
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
    public ResponseEntity<ApiResponse<String>> deleteEntity(@PathVariable String id) {
        try {
            entityAdminService.deleteEntity(id);
            return ResponseEntity.ok(ApiResponse.success("Entity deleted successfully", "success"));
        } catch (ResourceNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ApiResponse.error(e.getMessage()));
        } catch (CustomValidationException e) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(ApiResponse.error(e.getMessage()));
        } catch (Exception e) {
            log.error("Failed to delete entity {}: {}", id, e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Failed to delete entity"));
        }
    }
}
