package com.template.business.auth.controller;

import java.util.List;

import com.template.business.auth.dto.ApiResponse;
import com.template.business.auth.dto.AppLogDTO;
import com.template.business.auth.dto.LogStatusDTO;
import com.template.business.auth.dto.PageResponse;
import com.template.business.auth.dto.SearchRequest;
import com.template.business.auth.exception.ResourceNotFoundException;
import com.template.business.auth.service.AppLogAdminService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

/**
 * Controller for application log administration (read-only)
 * Requires ADMIN role
 */
@Slf4j
@RestController
@RequestMapping("/api/v1/admin/logs")
@PreAuthorize("hasRole('ADMIN')")
@RequiredArgsConstructor
public class AppLogAdminController {

    private final AppLogAdminService appLogAdminService;

    /**
     * Get all logs
     */
    @GetMapping
    public ResponseEntity<ApiResponse<List<AppLogDTO>>> getAllLogs() {
        try {
            List<AppLogDTO> dtos = appLogAdminService.getAllLogs();
            return ResponseEntity.ok(ApiResponse.success("Logs retrieved successfully", dtos));
        } catch (Exception e) {
            log.error("Failed to retrieve logs: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Failed to retrieve logs"));
        }
    }

    /**
     * Search logs with pagination, filtering, and sorting
     */
    @PostMapping("/search")
    public ResponseEntity<ApiResponse<PageResponse<AppLogDTO>>> searchLogs(@RequestBody SearchRequest request) {
        try {
            PageResponse<AppLogDTO> response = appLogAdminService.searchLogs(request);
            return ResponseEntity.ok(ApiResponse.success("Logs retrieved successfully", response));
        } catch (Exception e) {
            log.error("Failed to search logs: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Failed to search logs"));
        }
    }

    /**
     * Get log by ID (full details)
     */
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<AppLogDTO>> getLog(@PathVariable Long id) {
        try {
            AppLogDTO dto = appLogAdminService.getLogById(id);
            return ResponseEntity.ok(ApiResponse.success("Log retrieved successfully", dto));
        } catch (ResourceNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ApiResponse.error(e.getMessage()));
        } catch (Exception e) {
            log.error("Failed to retrieve log {}: {}", id, e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Failed to retrieve log"));
        }
    }

    /**
     * Get all log statuses for dropdown
     */
    @GetMapping("/statuses")
    public ResponseEntity<ApiResponse<List<LogStatusDTO>>> getLogStatuses() {
        try {
            List<LogStatusDTO> dtos = appLogAdminService.getAllLogStatuses();
            return ResponseEntity.ok(ApiResponse.success("Log statuses retrieved successfully", dtos));
        } catch (Exception e) {
            log.error("Failed to retrieve log statuses: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Failed to retrieve log statuses"));
        }
    }
}
