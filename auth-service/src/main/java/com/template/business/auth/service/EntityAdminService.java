package com.template.business.auth.service;

import java.util.Date;
import java.util.List;
import java.util.stream.Collectors;

import com.template.business.auth.dto.PageResponse;
import com.template.business.auth.dto.SearchRequest;
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

import com.template.business.auth.dto.EntityAdminDTO;
import com.template.business.auth.entity.ApplicationEntity;
import com.template.business.auth.exception.CustomValidationException;
import com.template.business.auth.exception.ErrorCode;
import com.template.business.auth.exception.ResourceNotFoundException;
import com.template.business.auth.repository.EntityRepository;

/**
 * Service for entity (application) administration (ADMIN only)
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class EntityAdminService {

    private final EntityRepository entityRepository;

    /**
     * Get all entities
     */
    public List<EntityAdminDTO> getAllEntities() {
        List<ApplicationEntity> entities = entityRepository.findAll();
        log.info("Admin {} retrieved {} entities",
                SecurityContextHolder.getContext().getAuthentication().getName(),
                entities.size());
        return entities.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    /**
     * Search entities with pagination, filtering, and sorting
     */
    public PageResponse<EntityAdminDTO> searchEntities(SearchRequest request) {
        Specification<ApplicationEntity> spec = SpecificationBuilder.buildSpecification(request);
        Sort sort = buildSort(request.getSort());
        Pageable pageable = PageRequest.of(request.getPage(), request.getPageSize(), sort);

        Page<ApplicationEntity> page = entityRepository.findAll(spec, pageable);
        Page<EntityAdminDTO> dtoPage = page.map(this::convertToDTO);

        return PageResponse.of(dtoPage);
    }

    private Sort buildSort(SearchRequest.SortInfo sortInfo) {
        if (sortInfo == null || sortInfo.getColumn() == null || sortInfo.getColumn().isEmpty()) {
            return Sort.by(Sort.Direction.ASC, "id");
        }
        Sort.Direction direction = "desc".equalsIgnoreCase(sortInfo.getOrder())
                ? Sort.Direction.DESC
                : Sort.Direction.ASC;
        return Sort.by(direction, sortInfo.getColumn());
    }

    /**
     * Get entity by ID
     */
    public EntityAdminDTO getEntityById(String id) {
        ApplicationEntity entity = entityRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(ErrorCode.ENTITY_NOT_FOUND, "Entity not found: " + id));
        return convertToDTO(entity);
    }

    /**
     * Create new entity
     * ID is auto-generated from the name (uppercase, spaces replaced with underscores)
     */
    @Transactional
    public EntityAdminDTO createEntity(EntityAdminDTO dto) {
        // Auto-generate ID from name
        String generatedId = generateEntityId(dto.getName());

        // Check if ID already exists, if so append a number
        String finalId = generatedId;
        int counter = 1;
        while (entityRepository.existsById(finalId)) {
            finalId = generatedId + "_" + counter;
            counter++;
        }

        ApplicationEntity entity = new ApplicationEntity();
        entity.setId(finalId);
        entity.setName(dto.getName());
        entity.setType(dto.getType());
        entity.setDescription(dto.getDescription());
        entity.setCreateDate(new Date());
        entity.setCreateUser(SecurityContextHolder.getContext().getAuthentication().getName());

        ApplicationEntity saved = entityRepository.save(entity);

        log.info("Admin {} created entity: {} (ID auto-generated: {})",
                SecurityContextHolder.getContext().getAuthentication().getName(),
                dto.getName(),
                saved.getId());

        return convertToDTO(saved);
    }

    /**
     * Generate entity ID from name
     * Converts to uppercase, replaces spaces with underscores, removes special characters
     */
    private String generateEntityId(String name) {
        if (name == null || name.trim().isEmpty()) {
            throw new CustomValidationException("Entity name is required");
        }
        return name.trim()
                .toUpperCase()
                .replaceAll("\\s+", "_")           // Replace spaces with underscores
                .replaceAll("[^A-Z0-9_]", "")      // Remove special characters
                .replaceAll("_+", "_")             // Replace multiple underscores with single
                .replaceAll("^_|_$", "");          // Remove leading/trailing underscores
    }

    /**
     * Update entity
     */
    @Transactional
    public EntityAdminDTO updateEntity(String id, EntityAdminDTO dto) {
        ApplicationEntity entity = entityRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(ErrorCode.ENTITY_NOT_FOUND, "Entity not found: " + id));

        entity.setName(dto.getName());
        entity.setType(dto.getType());
        entity.setDescription(dto.getDescription());

        ApplicationEntity updated = entityRepository.save(entity);

        log.info("Admin {} updated entity: {}",
                SecurityContextHolder.getContext().getAuthentication().getName(),
                id);

        return convertToDTO(updated);
    }

    /**
     * Delete entity
     */
    @Transactional
    public void deleteEntity(String id) {
        ApplicationEntity entity = entityRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(ErrorCode.ENTITY_NOT_FOUND, "Entity not found: " + id));

        // Check if entity has associated roles
        if (entity.getRoles() != null && !entity.getRoles().isEmpty()) {
            throw new CustomValidationException("Cannot delete entity with associated roles");
        }

        entityRepository.delete(entity);

        log.info("Admin {} deleted entity: {}",
                SecurityContextHolder.getContext().getAuthentication().getName(),
                id);
    }

    /**
     * Convert entity to DTO
     */
    private EntityAdminDTO convertToDTO(ApplicationEntity entity) {
        return EntityAdminDTO.builder()
                .id(entity.getId())
                .name(entity.getName())
                .type(entity.getType())
                .description(entity.getDescription())
                .createDate(entity.getCreateDate())
                .createUser(entity.getCreateUser())
                .build();
    }
}
