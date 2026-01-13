package com.template.business.auth.controller;

import com.template.business.auth.dto.ApiResponse;
import com.template.business.auth.dto.PasswordResetRequest;
import com.template.business.auth.dto.UserAdminDTO;
import com.template.business.auth.dto.UserRoleAssignRequest;
import com.template.business.auth.dto.UserStatusUpdateRequest;
import com.template.business.auth.dto.UserUpdateRequest;
import com.template.business.auth.service.UserAdminService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * REST controller for user administration (ADMIN only)
 *
 * <p>All endpoints require ADMIN role
 */
@Slf4j
@RestController
@RequestMapping("/api/v1/admin/users")
@PreAuthorize("hasRole('ADMIN')")
@RequiredArgsConstructor
public class UserAdminController {

    private final UserAdminService userAdminService;

    /**
     * Create new user
     */
    @PostMapping
    public ResponseEntity<ApiResponse<UserAdminDTO>> createUser(@Valid @RequestBody UserUpdateRequest request) {
        try {
            UserAdminDTO user = userAdminService.createUser(request);
            return ResponseEntity.ok(ApiResponse.success("User created successfully", user));
        } catch (Exception e) {
            log.error("Failed to create user: {}", e.getMessage());
            return ResponseEntity.status(400)
                    .body(ApiResponse.error(e.getMessage()));
        }
    }

    /**
     * Get all users
     */
    @GetMapping
    public ResponseEntity<ApiResponse<List<UserAdminDTO>>> getAllUsers() {
        try {
            List<UserAdminDTO> users = userAdminService.getAllUsers();
            return ResponseEntity.ok(ApiResponse.success("Users retrieved successfully", users));
        } catch (Exception e) {
            log.error("Failed to retrieve users: {}", e.getMessage());
            return ResponseEntity.status(500)
                    .body(ApiResponse.error("Failed to retrieve users"));
        }
    }

    /**
     * Get user by username
     */
    @GetMapping("/{username}")
    public ResponseEntity<ApiResponse<UserAdminDTO>> getUserByUsername(@PathVariable String username) {
        try {
            UserAdminDTO user = userAdminService.getUserByUsername(username);
            return ResponseEntity.ok(ApiResponse.success("User retrieved successfully", user));
        } catch (Exception e) {
            log.error("Failed to retrieve user {}: {}", username, e.getMessage());
            return ResponseEntity.status(404)
                    .body(ApiResponse.error(e.getMessage()));
        }
    }

    /**
     * Update user details
     */
    @PutMapping("/{username}")
    public ResponseEntity<ApiResponse<UserAdminDTO>> updateUser(
            @PathVariable String username,
            @Valid @RequestBody UserUpdateRequest request) {
        try {
            UserAdminDTO user = userAdminService.updateUser(username, request);
            return ResponseEntity.ok(ApiResponse.success("User updated successfully", user));
        } catch (Exception e) {
            log.error("Failed to update user {}: {}", username, e.getMessage());
            return ResponseEntity.status(400)
                    .body(ApiResponse.error(e.getMessage()));
        }
    }

    /**
     * Update user status (activate/deactivate)
     */
    @PutMapping("/{username}/status")
    public ResponseEntity<ApiResponse<UserAdminDTO>> updateUserStatus(
            @PathVariable String username,
            @Valid @RequestBody UserStatusUpdateRequest request) {
        try {
            UserAdminDTO user = userAdminService.updateUserStatus(username, request);
            return ResponseEntity.ok(ApiResponse.success("User status updated successfully", user));
        } catch (Exception e) {
            log.error("Failed to update user {} status: {}", username, e.getMessage());
            return ResponseEntity.status(400)
                    .body(ApiResponse.error(e.getMessage()));
        }
    }

    /**
     * Reset user password (admin can reset any user's password)
     * If newPassword is provided in request body, it will be set.
     * Otherwise, a temporary password will be auto-generated.
     */
    @PostMapping("/{username}/reset-password")
    public ResponseEntity<ApiResponse<String>> resetPassword(
            @PathVariable String username,
            @RequestBody(required = false) PasswordResetRequest request) {
        try {
            String newPassword = request != null ? request.getNewPassword() : null;
            String resultPassword = userAdminService.resetPassword(username, newPassword);

            if (newPassword != null && !newPassword.isEmpty()) {
                return ResponseEntity.ok(ApiResponse.success("Password set successfully", "Password updated"));
            } else {
                return ResponseEntity.ok(ApiResponse.success("Password reset successfully. Temporary password: " + resultPassword, resultPassword));
            }
        } catch (Exception e) {
            log.error("Failed to reset password for user {}: {}", username, e.getMessage());
            return ResponseEntity.status(400)
                    .body(ApiResponse.error(e.getMessage()));
        }
    }

    /**
     * Get user roles
     */
    @GetMapping("/{username}/roles")
    public ResponseEntity<ApiResponse<List<UserAdminDTO.UserRoleDTO>>> getUserRoles(@PathVariable String username) {
        try {
            List<UserAdminDTO.UserRoleDTO> roles = userAdminService.getUserRoles(username);
            return ResponseEntity.ok(ApiResponse.success("User roles retrieved successfully", roles));
        } catch (Exception e) {
            log.error("Failed to retrieve roles for user {}: {}", username, e.getMessage());
            return ResponseEntity.status(404)
                    .body(ApiResponse.error(e.getMessage()));
        }
    }

    /**
     * Assign role to user
     */
    @PostMapping("/{username}/roles")
    public ResponseEntity<ApiResponse<String>> assignRoleToUser(
            @PathVariable String username,
            @Valid @RequestBody UserRoleAssignRequest request) {
        try {
            userAdminService.assignRoleToUser(username, request);
            return ResponseEntity.ok(ApiResponse.success("Role assigned successfully", "success"));
        } catch (Exception e) {
            log.error("Failed to assign role to user {}: {}", username, e.getMessage());
            return ResponseEntity.status(400)
                    .body(ApiResponse.error(e.getMessage()));
        }
    }

    /**
     * Remove role from user
     */
    @DeleteMapping("/{username}/roles/{role}/entity/{entity}")
    public ResponseEntity<ApiResponse<String>> removeRoleFromUser(
            @PathVariable String username,
            @PathVariable String role,
            @PathVariable String entity) {
        try {
            userAdminService.removeRoleFromUser(username, role, entity);
            return ResponseEntity.ok(ApiResponse.success("Role removed successfully", "success"));
        } catch (Exception e) {
            log.error("Failed to remove role from user {}: {}", username, e.getMessage());
            return ResponseEntity.status(400)
                    .body(ApiResponse.error(e.getMessage()));
        }
    }
}
