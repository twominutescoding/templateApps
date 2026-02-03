package com.template.business.auth.service;

import java.util.List;
import java.util.stream.Collectors;

import com.template.business.auth.dto.AppLogDTO;
import com.template.business.auth.dto.LogStatusDTO;
import com.template.business.auth.dto.PageResponse;
import com.template.business.auth.dto.SearchRequest;
import com.template.business.auth.entity.AppLog;
import com.template.business.auth.entity.LogStatus;
import com.template.business.auth.exception.ErrorCode;
import com.template.business.auth.exception.ResourceNotFoundException;
import com.template.business.auth.repository.AppLogRepository;
import com.template.business.auth.repository.LogStatusRepository;
import com.template.business.auth.util.SpecificationBuilder;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Service for application log administration (read-only) (ADMIN only)
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class AppLogAdminService {

    private final AppLogRepository appLogRepository;
    private final LogStatusRepository logStatusRepository;

    private static final int MAX_TRUNCATED_LENGTH = 200;

    /**
     * Get all logs
     */
    @Transactional(readOnly = true)
    public List<AppLogDTO> getAllLogs() {
        List<AppLog> logs = appLogRepository.findAll();
        log.info("Admin {} retrieved {} logs",
                SecurityContextHolder.getContext().getAuthentication().getName(),
                logs.size());
        return logs.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    /**
     * Search logs with pagination, filtering, and sorting
     */
    @Transactional(readOnly = true)
    public PageResponse<AppLogDTO> searchLogs(SearchRequest request) {
        Specification<AppLog> spec = SpecificationBuilder.buildSpecification(request);
        Sort sort = buildSort(request.getSort());
        Pageable pageable = PageRequest.of(request.getPage(), request.getPageSize(), sort);

        Page<AppLog> page = appLogRepository.findAll(spec, pageable);
        Page<AppLogDTO> dtoPage = page.map(this::convertToDTO);

        return PageResponse.of(dtoPage);
    }

    private Sort buildSort(SearchRequest.SortInfo sortInfo) {
        if (sortInfo == null || sortInfo.getColumn() == null || sortInfo.getColumn().isEmpty()) {
            return Sort.by(Sort.Direction.DESC, "startTime");
        }
        Sort.Direction direction = "desc".equalsIgnoreCase(sortInfo.getOrder())
                ? Sort.Direction.DESC
                : Sort.Direction.ASC;
        return Sort.by(direction, sortInfo.getColumn());
    }

    /**
     * Get log by ID (full details, no truncation)
     */
    @Transactional(readOnly = true)
    public AppLogDTO getLogById(Long id) {
        AppLog appLog = appLogRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(ErrorCode.ENTITY_NOT_FOUND, "Log not found: " + id));
        return convertToFullDTO(appLog);
    }

    /**
     * Get all log statuses for dropdown
     */
    @Transactional(readOnly = true)
    public List<LogStatusDTO> getAllLogStatuses() {
        return logStatusRepository.findAll().stream()
                .map(this::convertStatusToDTO)
                .collect(Collectors.toList());
    }

    /**
     * Convert log entity to DTO (with truncated request/response for list view)
     */
    private AppLogDTO convertToDTO(AppLog appLog) {
        Long durationMs = null;
        if (appLog.getStartTime() != null && appLog.getEndTime() != null) {
            durationMs = appLog.getEndTime().getTime() - appLog.getStartTime().getTime();
        }

        // Get entity name if entity is set
        String entityName = null;
        if (appLog.getApplicationEntity() != null) {
            entityName = appLog.getApplicationEntity().getName();
        }

        return AppLogDTO.builder()
                .id(appLog.getId())
                .entity(appLog.getEntity())
                .entityName(entityName)
                .module(appLog.getModule())
                .request(truncate(appLog.getRequest()))
                .response(truncate(appLog.getResponse()))
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

    /**
     * Convert log entity to full DTO (without truncation for detail view)
     */
    private AppLogDTO convertToFullDTO(AppLog appLog) {
        Long durationMs = null;
        if (appLog.getStartTime() != null && appLog.getEndTime() != null) {
            durationMs = appLog.getEndTime().getTime() - appLog.getStartTime().getTime();
        }

        // Get entity name if entity is set
        String entityName = null;
        if (appLog.getApplicationEntity() != null) {
            entityName = appLog.getApplicationEntity().getName();
        }

        return AppLogDTO.builder()
                .id(appLog.getId())
                .entity(appLog.getEntity())
                .entityName(entityName)
                .module(appLog.getModule())
                .request(appLog.getRequest()) // Full content
                .response(appLog.getResponse()) // Full content
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

    /**
     * Truncate string for list display
     */
    private String truncate(String str) {
        if (str == null) {
            return null;
        }
        if (str.length() <= MAX_TRUNCATED_LENGTH) {
            return str;
        }
        return str.substring(0, MAX_TRUNCATED_LENGTH) + "...";
    }

    /**
     * Convert log status entity to DTO
     */
    private LogStatusDTO convertStatusToDTO(LogStatus logStatus) {
        return LogStatusDTO.builder()
                .status(logStatus.getStatus())
                .deleteAfter(logStatus.getDeleteAfter())
                .build();
    }
}
