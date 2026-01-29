package com.template.business.auth.service;

import com.template.business.auth.dto.PageResponse;
import com.template.business.auth.dto.RoleAdminDTO;
import com.template.business.auth.dto.RoleCreateRequest;
import com.template.business.auth.dto.SearchRequest;
import com.template.business.auth.entity.ApplicationEntity;
import com.template.business.auth.entity.Role;
import com.template.business.auth.exception.CustomAuthorizationException;
import com.template.business.auth.exception.ErrorCode;
import com.template.business.auth.exception.ResourceNotFoundException;
import com.template.business.auth.repository.EntityRepository;
import com.template.business.auth.repository.RoleRepository;
import jakarta.persistence.criteria.Predicate;
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

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * Service for role administration (ADMIN only)
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class RoleAdminService {

    private final RoleRepository roleRepository;
    private final EntityRepository entityRepository;

    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM-dd");

    /**
     * Get all roles
     */
    public List<RoleAdminDTO> getAllRoles() {
        List<Role> roles = roleRepository.findAll();
        return roles.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    /**
     * Search roles with pagination, filtering, and sorting
     */
    public PageResponse<RoleAdminDTO> searchRoles(SearchRequest request) {
        Specification<Role> spec = buildRoleSpecification(request);
        Sort sort = buildSort(request.getSort());
        Pageable pageable = PageRequest.of(request.getPage(), request.getPageSize(), sort);

        Page<Role> page = roleRepository.findAll(spec, pageable);
        Page<RoleAdminDTO> dtoPage = page.map(this::convertToDTO);

        return PageResponse.of(dtoPage);
    }

    private Specification<Role> buildRoleSpecification(SearchRequest request) {
        return (root, query, criteriaBuilder) -> {
            List<Predicate> predicates = new ArrayList<>();

            if (request.getFilters() != null) {
                for (Map.Entry<String, String> entry : request.getFilters().entrySet()) {
                    String field = entry.getKey();
                    String value = entry.getValue();

                    if (value != null && !value.isEmpty()) {
                        try {
                            // Handle composite key fields
                            if ("role".equals(field)) {
                                predicates.add(criteriaBuilder.like(
                                        criteriaBuilder.lower(root.get("id").get("role")),
                                        "%" + value.toLowerCase() + "%"
                                ));
                            } else if ("entity".equals(field)) {
                                predicates.add(criteriaBuilder.like(
                                        criteriaBuilder.lower(root.get("id").get("entity")),
                                        "%" + value.toLowerCase() + "%"
                                ));
                            } else {
                                // Regular fields
                                predicates.add(criteriaBuilder.like(
                                        criteriaBuilder.lower(root.get(field).as(String.class)),
                                        "%" + value.toLowerCase() + "%"
                                ));
                            }
                        } catch (Exception e) {
                            // Skip invalid fields
                        }
                    }
                }
            }

            // Handle date range filters
            if (request.getDateRanges() != null) {
                for (Map.Entry<String, SearchRequest.DateRange> entry : request.getDateRanges().entrySet()) {
                    String field = entry.getKey();
                    SearchRequest.DateRange dateRange = entry.getValue();

                    try {
                        if (dateRange.getFrom() != null && !dateRange.getFrom().isEmpty()) {
                            LocalDate fromDate = LocalDate.parse(dateRange.getFrom(), DATE_FORMATTER);
                            Date fromDateValue = java.sql.Timestamp.valueOf(fromDate.atStartOfDay());
                            predicates.add(criteriaBuilder.greaterThanOrEqualTo(root.get(field), fromDateValue));
                        }

                        if (dateRange.getTo() != null && !dateRange.getTo().isEmpty()) {
                            LocalDate toDate = LocalDate.parse(dateRange.getTo(), DATE_FORMATTER);
                            Date toDateValue = java.sql.Timestamp.valueOf(toDate.atTime(23, 59, 59));
                            predicates.add(criteriaBuilder.lessThanOrEqualTo(root.get(field), toDateValue));
                        }
                    } catch (Exception e) {
                        // Skip invalid date ranges
                    }
                }
            }

            return criteriaBuilder.and(predicates.toArray(new Predicate[0]));
        };
    }

    private Sort buildSort(SearchRequest.SortInfo sortInfo) {
        if (sortInfo == null || sortInfo.getColumn() == null || sortInfo.getColumn().isEmpty()) {
            return Sort.by(Sort.Direction.ASC, "id.role");
        }
        Sort.Direction direction = "desc".equalsIgnoreCase(sortInfo.getOrder())
                ? Sort.Direction.DESC
                : Sort.Direction.ASC;

        // Map frontend field names to entity paths
        String column = sortInfo.getColumn();
        if ("role".equals(column)) {
            column = "id.role";
        } else if ("entity".equals(column)) {
            column = "id.entity";
        }

        return Sort.by(direction, column);
    }

    /**
     * Get roles by entity
     */
    public List<RoleAdminDTO> getRolesByEntity(String entity) {
        List<Role> roles = roleRepository.findByIdEntity(entity);
        return roles.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    /**
     * Get role by role name and entity
     */
    public RoleAdminDTO getRoleByRoleAndEntity(String role, String entity) {
        Role roleEntity = roleRepository.findByIdRoleAndIdEntity(role, entity)
                .orElseThrow(() -> new ResourceNotFoundException(ErrorCode.ROLE_NOT_FOUND,
                        "Role not found: " + role + " for entity: " + entity));
        return convertToDTO(roleEntity);
    }

    /**
     * Create new role
     */
    @Transactional
    public RoleAdminDTO createRole(RoleCreateRequest request) {
        // Check if entity exists
        ApplicationEntity entity = entityRepository.findById(request.getEntity())
                .orElseThrow(() -> new ResourceNotFoundException(ErrorCode.ENTITY_NOT_FOUND,
                        "Entity not found: " + request.getEntity()));

        // Check if role already exists for this entity
        Role.RoleId roleId = new Role.RoleId(request.getRole(), request.getEntity());
        if (roleRepository.existsById(roleId)) {
            throw new CustomAuthorizationException(ErrorCode.DATA_INTEGRITY_ERROR,
                    "Role already exists: " + request.getRole() + " for entity: " + request.getEntity());
        }

        // Create new role
        Role role = new Role();
        role.setId(roleId);
        role.setRoleLevel(request.getRoleLevel());
        role.setDescription(request.getDescription());
        role.setCreateDate(new Date());
        role.setCreateUser(SecurityContextHolder.getContext().getAuthentication().getName());

        Role savedRole = roleRepository.save(role);
        log.info("Admin created role: {} for entity: {}", request.getRole(), request.getEntity());

        return convertToDTO(savedRole);
    }

    /**
     * Update role
     */
    @Transactional
    public RoleAdminDTO updateRole(String role, String entity, RoleCreateRequest request) {
        Role roleEntity = roleRepository.findByIdRoleAndIdEntity(role, entity)
                .orElseThrow(() -> new ResourceNotFoundException(ErrorCode.ROLE_NOT_FOUND,
                        "Role not found: " + role + " for entity: " + entity));

        roleEntity.setRoleLevel(request.getRoleLevel());
        roleEntity.setDescription(request.getDescription());

        Role updatedRole = roleRepository.save(roleEntity);
        log.info("Admin updated role: {} for entity: {}", role, entity);

        return convertToDTO(updatedRole);
    }

    /**
     * Delete role
     */
    @Transactional
    public void deleteRole(String role, String entity) {
        Role.RoleId roleId = new Role.RoleId(role, entity);
        Role roleEntity = roleRepository.findById(roleId)
                .orElseThrow(() -> new ResourceNotFoundException(ErrorCode.ROLE_NOT_FOUND,
                        "Role not found: " + role + " for entity: " + entity));

        // Check if role has users
        if (roleEntity.getUserRoles() != null && !roleEntity.getUserRoles().isEmpty()) {
            throw new CustomAuthorizationException(ErrorCode.DATA_INTEGRITY_ERROR,
                    "Cannot delete role with assigned users. Remove users first.");
        }

        roleRepository.delete(roleEntity);
        log.info("Admin deleted role: {} for entity: {}", role, entity);
    }

    /**
     * Convert Role entity to RoleAdminDTO
     */
    private RoleAdminDTO convertToDTO(Role role) {
        int userCount = role.getUserRoles() != null ? role.getUserRoles().size() : 0;

        return RoleAdminDTO.builder()
                .role(role.getId().getRole())
                .entity(role.getId().getEntity())
                .roleLevel(role.getRoleLevel())
                .description(role.getDescription())
                .createDate(role.getCreateDate())
                .createUser(role.getCreateUser())
                .userCount(userCount)
                .build();
    }
}
