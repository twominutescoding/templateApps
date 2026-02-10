package com.template.business.auth.controller;

import com.template.business.auth.dto.ApiResponse;
import com.template.business.auth.dto.UserStatusDTO;
import com.template.business.auth.entity.UserStatus;
import com.template.business.auth.repository.UserStatusRepository;
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
 * REST controller for user status lookup operations.
 *
 * <p>User statuses define the possible states for user accounts
 * (e.g., ACTIVE, INACTIVE, LOCKED).
 *
 * @author Template Business
 * @version 1.0
 */
@Slf4j
@RestController
@RequestMapping("/api/v1/admin/user-status")
@RequiredArgsConstructor
@Tag(name = "User Status", description = "User status lookup operations. Defines possible account states.")
public class UserStatusController {

    private final UserStatusRepository userStatusRepository;

    /**
     * Get all user status values
     */
    @Operation(
        summary = "Get all user statuses",
        description = "Returns all user status values for dropdown/selection. Requires ADMIN role.",
        security = @SecurityRequirement(name = "bearerAuth")
    )
    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<List<UserStatusDTO>>> getAllUserStatuses() {
        try {
            List<UserStatus> statuses = userStatusRepository.findAll();
            List<UserStatusDTO> dtos = statuses.stream()
                    .map(this::convertToDTO)
                    .collect(Collectors.toList());

            log.info("Retrieved {} user status values", dtos.size());

            return ResponseEntity.ok(ApiResponse.success("User statuses retrieved successfully", dtos));
        } catch (Exception e) {
            log.error("Failed to retrieve user statuses: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Failed to retrieve user statuses"));
        }
    }

    /**
     * Convert entity to DTO
     */
    private UserStatusDTO convertToDTO(UserStatus userStatus) {
        return UserStatusDTO.builder()
                .status(userStatus.getStatus())
                .description(userStatus.getDescription())
                .createDate(userStatus.getCreateDate())
                .createUser(userStatus.getCreateUser())
                .build();
    }
}
