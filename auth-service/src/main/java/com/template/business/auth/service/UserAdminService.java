package com.template.business.auth.service;

import com.template.business.auth.dto.UserAdminDTO;
import com.template.business.auth.dto.UserRoleAssignRequest;
import com.template.business.auth.dto.UserStatusUpdateRequest;
import com.template.business.auth.dto.UserUpdateRequest;
import com.template.business.auth.entity.Role;
import com.template.business.auth.entity.User;
import com.template.business.auth.entity.UserRole;
import com.template.business.auth.exception.CustomAuthorizationException;
import com.template.business.auth.exception.ErrorCode;
import com.template.business.auth.exception.ResourceNotFoundException;
import com.template.business.auth.repository.RoleRepository;
import com.template.business.auth.repository.UserRepository;
import com.template.business.auth.repository.UserRoleRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Date;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Service for user administration (ADMIN only)
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class UserAdminService {

    private final UserRepository userRepository;
    private final UserRoleRepository userRoleRepository;
    private final RoleRepository roleRepository;

    /**
     * Get all users
     */
    public List<UserAdminDTO> getAllUsers() {
        List<User> users = userRepository.findAll();
        return users.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    /**
     * Get user by username
     */
    public UserAdminDTO getUserByUsername(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException(ErrorCode.USER_NOT_FOUND));
        return convertToDTO(user);
    }

    /**
     * Update user details (admin)
     */
    @Transactional
    public UserAdminDTO updateUser(String username, UserUpdateRequest request) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException(ErrorCode.USER_NOT_FOUND));

        user.setFirstName(request.getFirstName());
        user.setLastName(request.getLastName());
        user.setEmail(request.getEmail());

        if (request.getCompany() != null) {
            user.setCompany(request.getCompany());
        }
        if (request.getTheme() != null) {
            user.setTheme(request.getTheme());
        }
        if (request.getImage() != null) {
            user.setImage(request.getImage());
        }

        User updatedUser = userRepository.save(user);
        log.info("Admin updated user: {}", username);

        return convertToDTO(updatedUser);
    }

    /**
     * Update user status (activate/deactivate)
     */
    @Transactional
    public UserAdminDTO updateUserStatus(String username, UserStatusUpdateRequest request) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException(ErrorCode.USER_NOT_FOUND));

        // Prevent admin from deactivating themselves
        String currentUsername = SecurityContextHolder.getContext().getAuthentication().getName();
        if (username.equals(currentUsername) && "INACTIVE".equals(request.getStatus())) {
            throw new CustomAuthorizationException(ErrorCode.UNAUTHORIZED_SESSION_ACCESS,
                    "Cannot deactivate your own account");
        }

        user.setStatus(request.getStatus());
        User updatedUser = userRepository.save(user);

        log.info("Admin changed user {} status to: {}", username, request.getStatus());

        return convertToDTO(updatedUser);
    }

    /**
     * Get user roles
     */
    public List<UserAdminDTO.UserRoleDTO> getUserRoles(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException(ErrorCode.USER_NOT_FOUND));

        return user.getUserRoles().stream()
                .map(ur -> UserAdminDTO.UserRoleDTO.builder()
                        .role(ur.getId().getRole())
                        .entity(ur.getId().getEntity())
                        .description(ur.getRole() != null ? ur.getRole().getDescription() : null)
                        .status(ur.getStatus())
                        .build())
                .collect(Collectors.toList());
    }

    /**
     * Assign role to user
     */
    @Transactional
    public void assignRoleToUser(String username, UserRoleAssignRequest request) {
        // Check if user exists
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException(ErrorCode.USER_NOT_FOUND));

        // Check if role exists
        Role role = roleRepository.findByIdRoleAndIdEntity(request.getRole(), request.getEntity())
                .orElseThrow(() -> new ResourceNotFoundException(ErrorCode.ROLE_NOT_FOUND,
                        "Role not found: " + request.getRole() + " for entity: " + request.getEntity()));

        // Check if user already has this role
        UserRole.UserRoleId userRoleId = new UserRole.UserRoleId(username, request.getRole(), request.getEntity());
        if (userRoleRepository.existsById(userRoleId)) {
            throw new CustomAuthorizationException(ErrorCode.UNAUTHORIZED_SESSION_ACCESS,
                    "User already has this role");
        }

        // Create user-role assignment
        UserRole userRole = new UserRole();
        userRole.setId(userRoleId);
        userRole.setStatus("ACTIVE");
        userRole.setCreateDate(new Date());
        userRole.setCreateUser(SecurityContextHolder.getContext().getAuthentication().getName());

        userRoleRepository.save(userRole);
        log.info("Admin assigned role {} (entity: {}) to user: {}", request.getRole(), request.getEntity(), username);
    }

    /**
     * Remove role from user
     */
    @Transactional
    public void removeRoleFromUser(String username, String role, String entity) {
        UserRole.UserRoleId userRoleId = new UserRole.UserRoleId(username, role, entity);
        UserRole userRole = userRoleRepository.findById(userRoleId)
                .orElseThrow(() -> new ResourceNotFoundException(ErrorCode.ROLE_NOT_FOUND,
                        "User does not have this role"));

        // Prevent removing admin role from yourself
        String currentUsername = SecurityContextHolder.getContext().getAuthentication().getName();
        if (username.equals(currentUsername) && "ADMIN".equals(role)) {
            throw new CustomAuthorizationException(ErrorCode.UNAUTHORIZED_SESSION_ACCESS,
                    "Cannot remove your own admin role");
        }

        userRoleRepository.delete(userRole);
        log.info("Admin removed role {} (entity: {}) from user: {}", role, entity, username);
    }

    /**
     * Convert User entity to UserAdminDTO
     */
    private UserAdminDTO convertToDTO(User user) {
        List<UserAdminDTO.UserRoleDTO> roles = user.getUserRoles().stream()
                .map(ur -> UserAdminDTO.UserRoleDTO.builder()
                        .role(ur.getId().getRole())
                        .entity(ur.getId().getEntity())
                        .description(ur.getRole() != null ? ur.getRole().getDescription() : null)
                        .status(ur.getStatus())
                        .build())
                .collect(Collectors.toList());

        return UserAdminDTO.builder()
                .username(user.getUsername())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .email(user.getEmail())
                .company(user.getCompany())
                .status(user.getStatus())
                .theme(user.getTheme())
                .image(user.getImage())
                .createDate(user.getCreateDate())
                .createUser(user.getCreateUser())
                .roles(roles)
                .build();
    }
}
