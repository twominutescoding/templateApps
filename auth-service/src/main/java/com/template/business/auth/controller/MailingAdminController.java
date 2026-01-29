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

/**
 * Controller for mailing administration (read-only)
 */
@Slf4j
@RestController
@RequestMapping("/api/v1/admin/mailings")
@PreAuthorize("hasRole('ADMIN')")
@RequiredArgsConstructor
public class MailingAdminController {

    private final MailingAdminService mailingAdminService;

    /**
     * Get all mailings
     */
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
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<MailingDTO>> getMailing(@PathVariable Long id) {
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
