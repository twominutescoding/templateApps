package com.template.business.auth.service;

import com.template.business.auth.entity.User;
import com.template.business.auth.entity.UserRole;
import com.template.business.auth.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.Collection;
import java.util.stream.Collectors;

/**
 * Database-backed implementation of Spring Security's UserDetailsService.
 * <p>
 * This service is responsible for loading user-specific data from the database
 * during the authentication process. It retrieves user information including
 * credentials and authorities (roles) from the database and converts them into
 * Spring Security's UserDetails format.
 * </p>
 * <p>
 * Key features:
 * <ul>
 *   <li>Loads user data from the database via UserRepository</li>
 *   <li>Validates user account status (must be ACTIVE)</li>
 *   <li>Extracts and converts user roles to granted authorities</li>
 *   <li>Filters out inactive user roles</li>
 *   <li>Integrates with Spring Security authentication framework</li>
 * </ul>
 * </p>
 *
 * @author Template Business
 * @version 1.0
 * @see org.springframework.security.core.userdetails.UserDetailsService
 * @see com.template.business.auth.repository.UserRepository
 */
@Service
@RequiredArgsConstructor
public class DatabaseUserDetailsService implements UserDetailsService {

    private final UserRepository userRepository;

    /**
     * Loads user details by username for Spring Security authentication.
     * <p>
     * This method is called by Spring Security during the authentication process.
     * It retrieves the user from the database, validates their account status,
     * and constructs a UserDetails object containing the user's credentials and
     * authorities.
     * </p>
     * <p>
     * Note: @Transactional is required to allow lazy-loading of user roles
     * when accessed by the JWT authentication filter.
     * </p>
     *
     * @param username the username identifying the user whose data is required
     * @return a fully populated UserDetails object containing user information
     * @throws UsernameNotFoundException if the user could not be found or is not active
     */
    @Override
    @org.springframework.transaction.annotation.Transactional(readOnly = true)
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("User not found: " + username));

        if (!"ACTIVE".equals(user.getStatus())) {
            throw new UsernameNotFoundException("User is not active: " + username);
        }

        return org.springframework.security.core.userdetails.User.builder()
                .username(user.getUsername())
                .password(user.getPassword())
                .authorities(getAuthorities(user))
                .accountExpired(false)
                .accountLocked(!"ACTIVE".equals(user.getStatus()))
                .credentialsExpired(false)
                .disabled(!"ACTIVE".equals(user.getStatus()))
                .build();
    }

    /**
     * Extracts and converts user roles to Spring Security granted authorities.
     * <p>
     * This method processes the user's role assignments, filtering out inactive
     * roles and converting the remaining active roles into GrantedAuthority objects
     * that Spring Security can use for authorization decisions.
     * </p>
     * <p>
     * Note: Spring Security requires authority names to be prefixed with "ROLE_"
     * for role-based authorization with @PreAuthorize("hasRole('...')").
     * Database stores "ADMIN", we convert to "ROLE_ADMIN".
     * </p>
     *
     * @param user the user entity containing role assignments
     * @return a collection of granted authorities derived from active user roles
     */
    private Collection<? extends GrantedAuthority> getAuthorities(User user) {
        return user.getUserRoles().stream()
                .filter(ur -> "ACTIVE".equals(ur.getStatus()))
                .map(UserRole::getRole)
                .map(role -> new SimpleGrantedAuthority("ROLE_" + role.getId().getRole()))
                .collect(Collectors.toList());
    }

    /**
     * Retrieves a user entity by username.
     * <p>
     * This method provides direct access to the User entity, useful for
     * operations that need the full user object rather than just the
     * UserDetails representation.
     * </p>
     *
     * @param username the username of the user to retrieve
     * @return the User entity if found, null otherwise
     */
    public User getUserByUsername(String username) {
        return userRepository.findByUsername(username).orElse(null);
    }
}
