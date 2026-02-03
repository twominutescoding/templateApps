package com.template.business.auth.service;

import com.template.business.auth.dto.AppLogCreateRequest;
import com.template.business.auth.dto.AppLogDTO;
import com.template.business.auth.entity.AppLog;
import com.template.business.auth.entity.ApplicationEntity;
import com.template.business.auth.exception.ErrorCode;
import com.template.business.auth.exception.ResourceNotFoundException;
import com.template.business.auth.repository.AppLogRepository;
import com.template.business.auth.repository.EntityRepository;
import com.template.business.auth.repository.LogStatusRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Async;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Date;
import java.util.concurrent.CompletableFuture;

/**
 * Service for creating application logs.
 * Provides both synchronous and asynchronous logging capabilities.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class AppLogService {

    private final AppLogRepository appLogRepository;
    private final EntityRepository entityRepository;
    private final LogStatusRepository logStatusRepository;

    /**
     * Create a log entry synchronously
     */
    @Transactional
    public AppLogDTO createLog(AppLogCreateRequest request) {
        log.debug("Creating log entry for module: {}, status: {}", request.getModule(), request.getStatus());

        AppLog appLog = buildAppLog(request);
        AppLog savedLog = appLogRepository.save(appLog);

        log.info("Created log entry with ID: {} for module: {}", savedLog.getId(), request.getModule());
        return convertToDTO(savedLog);
    }

    /**
     * Create a log entry asynchronously
     */
    @Async("appLogExecutor")
    @Transactional
    public CompletableFuture<AppLogDTO> createLogAsync(AppLogCreateRequest request) {
        log.debug("Creating log entry asynchronously for module: {}, status: {}", request.getModule(), request.getStatus());

        try {
            AppLog appLog = buildAppLog(request);
            AppLog savedLog = appLogRepository.save(appLog);

            log.info("Created async log entry with ID: {} for module: {}", savedLog.getId(), request.getModule());
            return CompletableFuture.completedFuture(convertToDTO(savedLog));
        } catch (Exception e) {
            log.error("Failed to create async log entry: {}", e.getMessage(), e);
            return CompletableFuture.failedFuture(e);
        }
    }

    /**
     * Build AppLog entity from request
     */
    private AppLog buildAppLog(AppLogCreateRequest request) {
        AppLog appLog = new AppLog();

        // Resolve entity ID from name
        String entityId = resolveEntityIdByName(request.getEntityName());
        appLog.setEntity(entityId);

        appLog.setModule(request.getModule());
        appLog.setRequest(request.getRequest());
        appLog.setResponse(request.getResponse());

        // Validate status exists
        if (request.getStatus() != null) {
            logStatusRepository.findById(request.getStatus())
                    .orElseThrow(() -> new ResourceNotFoundException(
                            ErrorCode.ENTITY_NOT_FOUND,
                            "Log status not found: " + request.getStatus()));
        }
        appLog.setStatus(request.getStatus());

        appLog.setStartTime(request.getStartTime() != null ? request.getStartTime() : new Date());
        appLog.setEndTime(request.getEndTime());
        appLog.setNotifiable(request.getNotifiable() != null ? request.getNotifiable() : "N");
        appLog.setNotificationSent("N");

        // Get username from authenticated user (JWT token)
        String authenticatedUsername = getAuthenticatedUsername();
        appLog.setUsername(authenticatedUsername);

        appLog.setCreateUser(request.getCreateUser());
        appLog.setCreateDate(new Date());

        return appLog;
    }

    /**
     * Get username from the authenticated user (JWT token)
     */
    private String getAuthenticatedUsername() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication != null && authentication.isAuthenticated()) {
            return authentication.getName();
        }
        return null;
    }

    /**
     * Resolve entity ID from entity name
     */
    private String resolveEntityIdByName(String entityName) {
        if (entityName == null || entityName.isEmpty()) {
            return null; // Entity is optional
        }

        ApplicationEntity entity = entityRepository.findByName(entityName)
                .orElseThrow(() -> new ResourceNotFoundException(
                        ErrorCode.ENTITY_NOT_FOUND,
                        "Entity not found by name: " + entityName));
        return entity.getId();
    }

    /**
     * Convert entity to DTO (minimal version for create response)
     */
    private AppLogDTO convertToDTO(AppLog appLog) {
        Long durationMs = null;
        if (appLog.getStartTime() != null && appLog.getEndTime() != null) {
            durationMs = appLog.getEndTime().getTime() - appLog.getStartTime().getTime();
        }

        // Resolve entity name from entity ID
        String entityName = null;
        if (appLog.getEntity() != null) {
            entityName = entityRepository.findById(appLog.getEntity())
                    .map(ApplicationEntity::getName)
                    .orElse(null);
        }

        return AppLogDTO.builder()
                .id(appLog.getId())
                .entity(appLog.getEntity())
                .entityName(entityName)
                .module(appLog.getModule())
                .request(appLog.getRequest())
                .response(appLog.getResponse())
                .status(appLog.getStatus())
                .startTime(appLog.getStartTime())
                .endTime(appLog.getEndTime())
                .durationMs(durationMs)
                .notifiable(appLog.getNotifiable())
                .notificationSent(appLog.getNotificationSent())
                .username(appLog.getUsername())
                .createUser(appLog.getCreateUser())
                .createDate(appLog.getCreateDate())
                .build();
    }
}
