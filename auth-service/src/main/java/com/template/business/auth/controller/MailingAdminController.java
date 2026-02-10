package com.template.business.auth.controller;

import java.util.List;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import com.template.business.auth.dto.ApiResponse;
import com.template.business.auth.dto.MailingDTO;
import com.template.business.auth.dto.PageResponse;
import com.template.business.auth.dto.SearchRequest;
import com.template.business.auth.exception.ResourceNotFoundException;
import com.template.business.auth.service.MailingAdminService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;

/**
 * REST controller for mailing administration (read-only).
 *
 * <p>Provides read-only access to the email/notification queue (T_MAILING table).
 * Mailings are created by various services and sent by a scheduled job.
 *
 * <p>All endpoints require ADMIN role.
 *
 * @author Template Business
 * @version 1.0
 */
@Slf4j
@RestController
@RequestMapping("/api/v1/admin/mailings")
@PreAuthorize("hasRole('ADMIN')")
@RequiredArgsConstructor
@Tag(name = "Mailing Administration", description = "Read-only access to email/notification queue. All endpoints require ADMIN role.")
@SecurityRequirement(name = "bearerAuth")
public class MailingAdminController {

    private final MailingAdminService mailingAdminService;

    /**
     * Get all mailings
     */
    @Operation(summary = "Get all mailings", description = "Returns all mailings in the queue. For large datasets, use search endpoint with pagination.")
    @GetMapping
    public ResponseEntity<ApiResponse<List<MailingDTO>>> getAllMailings() {
        try {
            List<MailingDTO> dtos = mailingAdminService.getAllMailings();
            return ResponseEntity.ok(ApiResponse.success("Mailings retrieved successfully", dtos));
        } catch (Exception e) {
            log.error("Failed to retrieve mailings: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Failed to retrieve mailings"));
        }
    }

    /**
     * Search mailings with pagination, filtering, and sorting
     */
    @Operation(summary = "Search mailings", description = "Search mailings with pagination, filtering by subject/type/sent status, and date range filtering.")
    @PostMapping("/search")
    public ResponseEntity<ApiResponse<PageResponse<MailingDTO>>> searchMailings(@RequestBody SearchRequest request) {
        try {
            PageResponse<MailingDTO> response = mailingAdminService.searchMailings(request);
            return ResponseEntity.ok(ApiResponse.success("Mailings retrieved successfully", response));
        } catch (Exception e) {
            log.error("Failed to search mailings: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Failed to search mailings"));
        }
    }

    /**
     * Get mailing by ID
     */
    @Operation(summary = "Get mailing by ID", description = "Returns full mailing details including body and attachment info.")
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<MailingDTO>> getMailing(
            @Parameter(description = "Mailing ID") @PathVariable Long id) {
        try {
            MailingDTO dto = mailingAdminService.getMailingById(id);
            return ResponseEntity.ok(ApiResponse.success("Mailing retrieved successfully", dto));
        } catch (ResourceNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ApiResponse.error(e.getMessage()));
        } catch (Exception e) {
            log.error("Failed to retrieve mailing {}: {}", id, e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Failed to retrieve mailing"));
        }
    }
}
