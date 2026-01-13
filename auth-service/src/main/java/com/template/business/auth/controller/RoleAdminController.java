package com.template.business.auth.controller;

import com.template.business.auth.dto.ApiResponse;
import com.template.business.auth.dto.RoleAdminDTO;
import com.template.business.auth.dto.RoleCreateRequest;
import com.template.business.auth.service.RoleAdminService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * REST controller for role administration (ADMIN only)
 *
 * <p>All endpoints require ADMIN role
 */
@Slf4j
@RestController
@RequestMapping("/api/v1/admin/roles")
@PreAuthorize("hasRole('ADMIN')")
@RequiredArgsConstructor
public class RoleAdminController {

    private final RoleAdminService roleAdminService;

    /**
     * Get all roles (optionally filter by entity)
     */
    @GetMapping
    public ResponseEntity<ApiResponse<List<RoleAdminDTO>>> getAllRoles(
            @RequestParam(required = false) String entity) {
        try {
            List<RoleAdminDTO> roles = entity != null
                    ? roleAdminService.getRolesByEntity(entity)
                    : roleAdminService.getAllRoles();
            return ResponseEntity.ok(ApiResponse.success("Roles retrieved successfully", roles));
        } catch (Exception e) {
            log.error("Failed to retrieve roles: {}", e.getMessage());
            return ResponseEntity.status(500)
                    .body(ApiResponse.error("Failed to retrieve roles"));
        }
    }

    /**
     * Get role by role name and entity
     */
    @GetMapping("/{role}/entity/{entity}")
    public ResponseEntity<ApiResponse<RoleAdminDTO>> getRoleByRoleAndEntity(
            @PathVariable String role,
            @PathVariable String entity) {
        try {
            RoleAdminDTO roleDTO = roleAdminService.getRoleByRoleAndEntity(role, entity);
            return ResponseEntity.ok(ApiResponse.success("Role retrieved successfully", roleDTO));
        } catch (Exception e) {
            log.error("Failed to retrieve role {}/{}: {}", role, entity, e.getMessage());
            return ResponseEntity.status(404)
                    .body(ApiResponse.error(e.getMessage()));
        }
    }

    /**
     * Create new role
     */
    @PostMapping
    public ResponseEntity<ApiResponse<RoleAdminDTO>> createRole(@Valid @RequestBody RoleCreateRequest request) {
        try {
            RoleAdminDTO role = roleAdminService.createRole(request);
            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(ApiResponse.success("Role created successfully", role));
        } catch (Exception e) {
            log.error("Failed to create role: {}", e.getMessage());
            return ResponseEntity.status(400)
                    .body(ApiResponse.error(e.getMessage()));
        }
    }

    /**
     * Update role
     */
    @PutMapping("/{role}/entity/{entity}")
    public ResponseEntity<ApiResponse<RoleAdminDTO>> updateRole(
            @PathVariable String role,
            @PathVariable String entity,
            @Valid @RequestBody RoleCreateRequest request) {
        try {
            RoleAdminDTO updatedRole = roleAdminService.updateRole(role, entity, request);
            return ResponseEntity.ok(ApiResponse.success("Role updated successfully", updatedRole));
        } catch (Exception e) {
            log.error("Failed to update role {}/{}: {}", role, entity, e.getMessage());
            return ResponseEntity.status(400)
                    .body(ApiResponse.error(e.getMessage()));
        }
    }

    /**
     * Delete role
     */
    @DeleteMapping("/{role}/entity/{entity}")
    public ResponseEntity<ApiResponse<String>> deleteRole(
            @PathVariable String role,
            @PathVariable String entity) {
        try {
            roleAdminService.deleteRole(role, entity);
            return ResponseEntity.ok(ApiResponse.success("Role deleted successfully", "success"));
        } catch (Exception e) {
            log.error("Failed to delete role {}/{}: {}", role, entity, e.getMessage());
            return ResponseEntity.status(400)
                    .body(ApiResponse.error(e.getMessage()));
        }
    }
}
