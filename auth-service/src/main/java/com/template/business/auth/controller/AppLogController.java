package com.template.business.auth.controller;

import com.template.business.auth.dto.ApiResponse;
import com.template.business.auth.dto.AppLogCreateRequest;
import com.template.business.auth.dto.AppLogDTO;
import com.template.business.auth.exception.ResourceNotFoundException;
import com.template.business.auth.service.AppLogService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

/**
 * Controller for creating application logs.
 * Used by other backend services to log their operations.
 * Requires JWT authentication.
 */
@Slf4j
@RestController
@RequestMapping("/api/v1/logs")
@RequiredArgsConstructor
public class AppLogController {

    private final AppLogService appLogService;

    /**
     * Create a log entry synchronously
     */
    @PostMapping
    public ResponseEntity<ApiResponse<AppLogDTO>> createLog(@Valid @RequestBody AppLogCreateRequest request) {
        try {
            log.debug("Creating log entry: module={}, status={}, createUser={}",
                    request.getModule(), request.getStatus(), request.getCreateUser());
            AppLogDTO dto = appLogService.createLog(request);
            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(ApiResponse.success("Log created successfully", dto));
        } catch (ResourceNotFoundException e) {
            log.warn("Failed to create log - resource not found: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.error(e.getMessage()));
        } catch (Exception e) {
            log.error("Failed to create log entry: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Failed to create log entry"));
        }
    }

    /**
     * Create a log entry asynchronously
     * Returns 202 Accepted immediately, log is processed in background
     */
    @PostMapping("/async")
    public ResponseEntity<ApiResponse<String>> createLogAsync(@Valid @RequestBody AppLogCreateRequest request) {
        try {
            log.debug("Creating log entry asynchronously: module={}, status={}, createUser={}",
                    request.getModule(), request.getStatus(), request.getCreateUser());
            appLogService.createLogAsync(request);
            return ResponseEntity.status(HttpStatus.ACCEPTED)
                    .body(ApiResponse.success("Log creation accepted", "Log entry will be created asynchronously"));
        } catch (Exception e) {
            log.error("Failed to accept async log entry: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Failed to accept log entry"));
        }
    }
}
