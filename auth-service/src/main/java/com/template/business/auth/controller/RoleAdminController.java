package com.template.business.auth.controller;

import com.template.business.auth.dto.ApiResponse;
import com.template.business.auth.dto.PageResponse;
import com.template.business.auth.dto.RoleAdminDTO;
import com.template.business.auth.dto.RoleCreateRequest;
import com.template.business.auth.dto.SearchRequest;
import com.template.business.auth.service.RoleAdminService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;

import java.util.List;

/**
 * REST controller for role administration.
 *
 * <p>Provides CRUD operations for role management:
 * <ul>
 *   <li>Role creation and deletion</li>
 *   <li>Role updates</li>
 *   <li>Role listing and search</li>
 * </ul>
 *
 * <p>Roles are entity-scoped, meaning the same role name can exist
 * for different entities with different permissions.
 *
 * <p>All endpoints require ADMIN role.
 *
 * @author Template Business
 * @version 1.0
 */
@Slf4j
@RestController
@RequestMapping("/api/v1/admin/roles")
@PreAuthorize("hasRole('ADMIN')")
@RequiredArgsConstructor
@Tag(name = "Role Administration", description = "Role management APIs for administrators. Roles are entity-scoped. All endpoints require ADMIN role.")
@SecurityRequirement(name = "bearerAuth")
public class RoleAdminController {

    private final RoleAdminService roleAdminService;

    /**
     * Get all roles (optionally filter by entity)
     */
    @Operation(summary = "Get all roles", description = "Returns all roles, optionally filtered by entity ID.")
    @GetMapping
    public ResponseEntity<ApiResponse<List<RoleAdminDTO>>> getAllRoles(
            @Parameter(description = "Optional entity ID to filter roles") @RequestParam(required = false) String entity) {
        try {
            List<RoleAdminDTO> roles = entity != null
                    ? roleAdminService.getRolesByEntity(entity)
                    : roleAdminService.getAllRoles();
            return ResponseEntity.ok(ApiResponse.success("Roles retrieved successfully", roles));
        } catch (Exception e) {
            log.error("Failed to retrieve roles: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Failed to retrieve roles"));
        }
    }

    /**
     * Search roles with pagination, filtering, and sorting
     */
    @Operation(summary = "Search roles", description = "Search roles with pagination, filtering, and sorting.")
    @PostMapping("/search")
    public ResponseEntity<ApiResponse<PageResponse<RoleAdminDTO>>> searchRoles(@RequestBody SearchRequest request) {
        try {
            PageResponse<RoleAdminDTO> response = roleAdminService.searchRoles(request);
            return ResponseEntity.ok(ApiResponse.success("Roles retrieved successfully", response));
        } catch (Exception e) {
            log.error("Failed to search roles: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Failed to search roles"));
        }
    }

    /**
     * Get role by role name and entity
     */
    @Operation(summary = "Get role by name and entity", description = "Returns a specific role by its name and entity ID.")
    @GetMapping("/{role}/entity/{entity}")
    public ResponseEntity<ApiResponse<RoleAdminDTO>> getRoleByRoleAndEntity(
            @Parameter(description = "Role name") @PathVariable String role,
            @Parameter(description = "Entity ID") @PathVariable String entity) {
        try {
            RoleAdminDTO roleDTO = roleAdminService.getRoleByRoleAndEntity(role, entity);
            return ResponseEntity.ok(ApiResponse.success("Role retrieved successfully", roleDTO));
        } catch (Exception e) {
            log.error("Failed to retrieve role {}/{}: {}", role, entity, e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ApiResponse.error(e.getMessage()));
        }
    }

    /**
     * Create new role
     */
    @Operation(summary = "Create new role", description = "Creates a new role for a specific entity.")
    @PostMapping
    public ResponseEntity<ApiResponse<RoleAdminDTO>> createRole(@Valid @RequestBody RoleCreateRequest request) {
        try {
            RoleAdminDTO role = roleAdminService.createRole(request);
            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(ApiResponse.success("Role created successfully", role));
        } catch (Exception e) {
            log.error("Failed to create role: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.error(e.getMessage()));
        }
    }

    /**
     * Update role
     */
    @Operation(summary = "Update role", description = "Updates an existing role's description.")
    @PutMapping("/{role}/entity/{entity}")
    public ResponseEntity<ApiResponse<RoleAdminDTO>> updateRole(
            @Parameter(description = "Role name") @PathVariable String role,
            @Parameter(description = "Entity ID") @PathVariable String entity,
            @Valid @RequestBody RoleCreateRequest request) {
        try {
            RoleAdminDTO updatedRole = roleAdminService.updateRole(role, entity, request);
            return ResponseEntity.ok(ApiResponse.success("Role updated successfully", updatedRole));
        } catch (Exception e) {
            log.error("Failed to update role {}/{}: {}", role, entity, e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.error(e.getMessage()));
        }
    }

    /**
     * Delete role
     */
    @Operation(summary = "Delete role", description = "Deletes a role. Will fail if role is assigned to any users.")
    @DeleteMapping("/{role}/entity/{entity}")
    public ResponseEntity<ApiResponse<String>> deleteRole(
            @Parameter(description = "Role name") @PathVariable String role,
            @Parameter(description = "Entity ID") @PathVariable String entity) {
        try {
            roleAdminService.deleteRole(role, entity);
            return ResponseEntity.ok(ApiResponse.success("Role deleted successfully", "success"));
        } catch (Exception e) {
            log.error("Failed to delete role {}/{}: {}", role, entity, e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.error(e.getMessage()));
        }
    }
}
