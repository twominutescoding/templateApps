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
import com.template.business.auth.dto.MailingListDTO;
import com.template.business.auth.dto.MailingListUserDTO;
import com.template.business.auth.dto.PageResponse;
import com.template.business.auth.dto.SearchRequest;
import com.template.business.auth.exception.CustomValidationException;
import com.template.business.auth.exception.ResourceNotFoundException;
import com.template.business.auth.service.MailingListAdminService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;

@Slf4j
@RestController
@RequestMapping("/api/v1/admin/mailing-lists")
@PreAuthorize("hasRole('ADMIN')")
@RequiredArgsConstructor
@Tag(name = "Mailing List Administration", description = "Mailing list management APIs. All endpoints require ADMIN role.")
@SecurityRequirement(name = "bearerAuth")
public class MailingListAdminController {

    private final MailingListAdminService mailingListAdminService;

    @Operation(summary = "Get all mailing lists")
    @GetMapping
    public ResponseEntity<ApiResponse<List<MailingListDTO>>> getAllMailingLists() {
        try {
            List<MailingListDTO> dtos = mailingListAdminService.getAllMailingLists();
            return ResponseEntity.ok(ApiResponse.success("Mailing lists retrieved successfully", dtos));
        } catch (Exception e) {
            log.error("Failed to retrieve mailing lists: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Failed to retrieve mailing lists"));
        }
    }

    @Operation(summary = "Search mailing lists", description = "Search mailing lists with pagination, filtering, and sorting.")
    @PostMapping("/search")
    public ResponseEntity<ApiResponse<PageResponse<MailingListDTO>>> searchMailingLists(@RequestBody SearchRequest request) {
        try {
            PageResponse<MailingListDTO> response = mailingListAdminService.searchMailingLists(request);
            return ResponseEntity.ok(ApiResponse.success("Mailing lists retrieved successfully", response));
        } catch (Exception e) {
            log.error("Failed to search mailing lists: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Failed to search mailing lists"));
        }
    }

    @Operation(summary = "Get mailing list by name")
    @GetMapping("/{name}")
    public ResponseEntity<ApiResponse<MailingListDTO>> getMailingList(
            @Parameter(description = "Mailing list name") @PathVariable String name) {
        try {
            MailingListDTO dto = mailingListAdminService.getMailingListByName(name);
            return ResponseEntity.ok(ApiResponse.success("Mailing list retrieved successfully", dto));
        } catch (ResourceNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ApiResponse.error(e.getMessage()));
        } catch (Exception e) {
            log.error("Failed to retrieve mailing list {}: {}", name, e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Failed to retrieve mailing list"));
        }
    }

    @Operation(summary = "Create new mailing list")
    @PostMapping
    public ResponseEntity<ApiResponse<MailingListDTO>> createMailingList(@Valid @RequestBody MailingListDTO dto) {
        try {
            MailingListDTO created = mailingListAdminService.createMailingList(dto);
            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(ApiResponse.success("Mailing list created successfully", created));
        } catch (CustomValidationException e) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(ApiResponse.error(e.getMessage()));
        } catch (Exception e) {
            log.error("Failed to create mailing list: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Failed to create mailing list: " + e.getMessage()));
        }
    }

    @Operation(summary = "Update mailing list")
    @PutMapping("/{name}")
    public ResponseEntity<ApiResponse<MailingListDTO>> updateMailingList(
            @Parameter(description = "Mailing list name") @PathVariable String name,
            @Valid @RequestBody MailingListDTO dto) {
        try {
            MailingListDTO updated = mailingListAdminService.updateMailingList(name, dto);
            return ResponseEntity.ok(ApiResponse.success("Mailing list updated successfully", updated));
        } catch (ResourceNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ApiResponse.error(e.getMessage()));
        } catch (Exception e) {
            log.error("Failed to update mailing list {}: {}", name, e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Failed to update mailing list"));
        }
    }

    @Operation(summary = "Delete mailing list")
    @DeleteMapping("/{name}")
    public ResponseEntity<ApiResponse<String>> deleteMailingList(
            @Parameter(description = "Mailing list name") @PathVariable String name) {
        try {
            mailingListAdminService.deleteMailingList(name);
            return ResponseEntity.ok(ApiResponse.success("Mailing list deleted successfully", "success"));
        } catch (ResourceNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ApiResponse.error(e.getMessage()));
        } catch (Exception e) {
            log.error("Failed to delete mailing list {}: {}", name, e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Failed to delete mailing list"));
        }
    }

    @Operation(summary = "Get mailing list users")
    @GetMapping("/{name}/users")
    public ResponseEntity<ApiResponse<List<MailingListUserDTO>>> getMailingListUsers(
            @Parameter(description = "Mailing list name") @PathVariable String name) {
        try {
            List<MailingListUserDTO> users = mailingListAdminService.getMailingListUsers(name);
            return ResponseEntity.ok(ApiResponse.success("Users retrieved successfully", users));
        } catch (ResourceNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ApiResponse.error(e.getMessage()));
        } catch (Exception e) {
            log.error("Failed to retrieve users for mailing list {}: {}", name, e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Failed to retrieve mailing list users"));
        }
    }

    @Operation(summary = "Add user to mailing list")
    @PostMapping("/{name}/users")
    public ResponseEntity<ApiResponse<MailingListUserDTO>> addUserToMailingList(
            @Parameter(description = "Mailing list name") @PathVariable String name,
            @RequestBody java.util.Map<String, String> request) {
        try {
            String username = request.get("username");
            if (username == null || username.isBlank()) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(ApiResponse.error("Username is required"));
            }
            MailingListUserDTO dto = mailingListAdminService.addUserToMailingList(name, username);
            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(ApiResponse.success("User added to mailing list successfully", dto));
        } catch (ResourceNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ApiResponse.error(e.getMessage()));
        } catch (CustomValidationException e) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(ApiResponse.error(e.getMessage()));
        } catch (Exception e) {
            log.error("Failed to add user to mailing list {}: {}", name, e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Failed to add user to mailing list"));
        }
    }

    @Operation(summary = "Remove user from mailing list")
    @DeleteMapping("/{name}/users/{username}")
    public ResponseEntity<ApiResponse<String>> removeUserFromMailingList(
            @Parameter(description = "Mailing list name") @PathVariable String name,
            @Parameter(description = "Username") @PathVariable String username) {
        try {
            mailingListAdminService.removeUserFromMailingList(name, username);
            return ResponseEntity.ok(ApiResponse.success("User removed from mailing list successfully", "success"));
        } catch (ResourceNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ApiResponse.error(e.getMessage()));
        } catch (Exception e) {
            log.error("Failed to remove user {} from mailing list {}: {}", username, name, e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Failed to remove user from mailing list"));
        }
    }
}
