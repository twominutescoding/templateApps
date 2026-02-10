package com.template.business.auth.controller;

import com.template.business.auth.dto.ApiResponse;
import com.template.business.auth.dto.PageResponse;
import com.template.business.auth.dto.PasswordResetRequest;
import com.template.business.auth.dto.SearchRequest;
import com.template.business.auth.dto.UserAdminDTO;
import com.template.business.auth.dto.UserRoleAssignRequest;
import com.template.business.auth.dto.UserStatusUpdateRequest;
import com.template.business.auth.dto.UserUpdateRequest;
import com.template.business.auth.service.UserAdminService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;

import java.util.List;

/**
 * REST controller for user administration.
 *
 * <p>Provides CRUD operations for user management including:
 * <ul>
 *   <li>User creation and deletion</li>
 *   <li>User profile updates</li>
 *   <li>User status management (activate/deactivate)</li>
 *   <li>Password reset</li>
 *   <li>Role assignment and removal</li>
 * </ul>
 *
 * <p>All endpoints require ADMIN role.
 *
 * @author Template Business
 * @version 1.0
 */
@Slf4j
@RestController
@RequestMapping("/api/v1/admin/users")
@PreAuthorize("hasRole('ADMIN')")
@RequiredArgsConstructor
@Tag(name = "User Administration", description = "User management APIs for administrators. All endpoints require ADMIN role.")
@SecurityRequirement(name = "bearerAuth")
public class UserAdminController {

    private final UserAdminService userAdminService;

    /**
     * Create new user
     */
    @Operation(
        summary = "Create new user",
        description = "Creates a new user account with the specified details. Password is hashed using BCrypt."
    )
    @ApiResponses(value = {
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "User created successfully"),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "400", description = "Invalid user data or username already exists")
    })
    @PostMapping
    public ResponseEntity<ApiResponse<UserAdminDTO>> createUser(@Valid @RequestBody UserUpdateRequest request) {
        try {
            UserAdminDTO user = userAdminService.createUser(request);
            return ResponseEntity.ok(ApiResponse.success("User created successfully", user));
        } catch (Exception e) {
            log.error("Failed to create user: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.error(e.getMessage()));
        }
    }

    /**
     * Search users with pagination, filtering, and sorting
     */
    @Operation(
        summary = "Search users",
        description = "Search users with pagination, filtering by username/email/status, and sorting."
    )
    @PostMapping("/search")
    public ResponseEntity<ApiResponse<PageResponse<UserAdminDTO>>> searchUsers(@RequestBody SearchRequest request) {
        try {
            PageResponse<UserAdminDTO> response = userAdminService.searchUsers(request);
            return ResponseEntity.ok(ApiResponse.success("Users retrieved successfully", response));
        } catch (Exception e) {
            log.error("Failed to search users: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Failed to search users"));
        }
    }

    /**
     * Get all users
     */
    @Operation(summary = "Get all users", description = "Returns a list of all users in the system.")
    @GetMapping
    public ResponseEntity<ApiResponse<List<UserAdminDTO>>> getAllUsers() {
        try {
            List<UserAdminDTO> users = userAdminService.getAllUsers();
            return ResponseEntity.ok(ApiResponse.success("Users retrieved successfully", users));
        } catch (Exception e) {
            log.error("Failed to retrieve users: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Failed to retrieve users"));
        }
    }

    /**
     * Get user by username
     */
    @Operation(summary = "Get user by username", description = "Returns user details including profile and roles.")
    @GetMapping("/{username}")
    public ResponseEntity<ApiResponse<UserAdminDTO>> getUserByUsername(
            @Parameter(description = "Username of the user to retrieve") @PathVariable String username) {
        try {
            UserAdminDTO user = userAdminService.getUserByUsername(username);
            return ResponseEntity.ok(ApiResponse.success("User retrieved successfully", user));
        } catch (Exception e) {
            log.error("Failed to retrieve user {}: {}", username, e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ApiResponse.error(e.getMessage()));
        }
    }

    /**
     * Update user details
     */
    @Operation(summary = "Update user", description = "Updates user profile information such as email, name, and company.")
    @PutMapping("/{username}")
    public ResponseEntity<ApiResponse<UserAdminDTO>> updateUser(
            @Parameter(description = "Username of the user to update") @PathVariable String username,
            @Valid @RequestBody UserUpdateRequest request) {
        try {
            UserAdminDTO user = userAdminService.updateUser(username, request);
            return ResponseEntity.ok(ApiResponse.success("User updated successfully", user));
        } catch (Exception e) {
            log.error("Failed to update user {}: {}", username, e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.error(e.getMessage()));
        }
    }

    /**
     * Update user status (activate/deactivate)
     */
    @Operation(summary = "Update user status", description = "Activates or deactivates a user account.")
    @PutMapping("/{username}/status")
    public ResponseEntity<ApiResponse<UserAdminDTO>> updateUserStatus(
            @Parameter(description = "Username of the user") @PathVariable String username,
            @Valid @RequestBody UserStatusUpdateRequest request) {
        try {
            UserAdminDTO user = userAdminService.updateUserStatus(username, request);
            return ResponseEntity.ok(ApiResponse.success("User status updated successfully", user));
        } catch (Exception e) {
            log.error("Failed to update user {} status: {}", username, e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.error(e.getMessage()));
        }
    }

    /**
     * Reset user password (admin can reset any user's password)
     * If newPassword is provided in request body, it will be set.
     * Otherwise, a temporary password will be auto-generated.
     */
    @Operation(
        summary = "Reset user password",
        description = "Resets a user's password. If newPassword is provided, it will be set. " +
                      "Otherwise, a temporary password is auto-generated and returned."
    )
    @PostMapping("/{username}/reset-password")
    public ResponseEntity<ApiResponse<String>> resetPassword(
            @Parameter(description = "Username of the user") @PathVariable String username,
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
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.error(e.getMessage()));
        }
    }

    /**
     * Get user roles
     */
    @Operation(summary = "Get user roles", description = "Returns all roles assigned to a user across all entities.")
    @GetMapping("/{username}/roles")
    public ResponseEntity<ApiResponse<List<UserAdminDTO.UserRoleDTO>>> getUserRoles(
            @Parameter(description = "Username of the user") @PathVariable String username) {
        try {
            List<UserAdminDTO.UserRoleDTO> roles = userAdminService.getUserRoles(username);
            return ResponseEntity.ok(ApiResponse.success("User roles retrieved successfully", roles));
        } catch (Exception e) {
            log.error("Failed to retrieve roles for user {}: {}", username, e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ApiResponse.error(e.getMessage()));
        }
    }

    /**
     * Assign role to user
     */
    @Operation(summary = "Assign role to user", description = "Assigns a specific role to a user for a given entity.")
    @PostMapping("/{username}/roles")
    public ResponseEntity<ApiResponse<String>> assignRoleToUser(
            @Parameter(description = "Username of the user") @PathVariable String username,
            @Valid @RequestBody UserRoleAssignRequest request) {
        try {
            userAdminService.assignRoleToUser(username, request);
            return ResponseEntity.ok(ApiResponse.success("Role assigned successfully", "success"));
        } catch (Exception e) {
            log.error("Failed to assign role to user {}: {}", username, e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.error(e.getMessage()));
        }
    }

    /**
     * Remove role from user
     */
    @Operation(summary = "Remove role from user", description = "Removes a specific role from a user for a given entity.")
    @DeleteMapping("/{username}/roles/{role}/entity/{entity}")
    public ResponseEntity<ApiResponse<String>> removeRoleFromUser(
            @Parameter(description = "Username of the user") @PathVariable String username,
            @Parameter(description = "Role name to remove") @PathVariable String role,
            @Parameter(description = "Entity ID") @PathVariable String entity) {
        try {
            userAdminService.removeRoleFromUser(username, role, entity);
            return ResponseEntity.ok(ApiResponse.success("Role removed successfully", "success"));
        } catch (Exception e) {
            log.error("Failed to remove role from user {}: {}", username, e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.error(e.getMessage()));
        }
    }

    /**
     * Delete user
     */
    @Operation(summary = "Delete user", description = "Permanently deletes a user and all associated roles and sessions.")
    @DeleteMapping("/{username}")
    public ResponseEntity<ApiResponse<String>> deleteUser(
            @Parameter(description = "Username of the user to delete") @PathVariable String username) {
        try {
            userAdminService.deleteUser(username);
            return ResponseEntity.ok(ApiResponse.success("User deleted successfully", "success"));
        } catch (Exception e) {
            log.error("Failed to delete user {}: {}", username, e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.error(e.getMessage()));
        }
    }
}
