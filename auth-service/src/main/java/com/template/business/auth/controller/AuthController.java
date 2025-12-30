package com.template.business.auth.controller;

import com.template.business.auth.dto.*;
import com.template.business.auth.entity.User;
import com.template.business.auth.entity.UserRole;
import com.template.business.auth.security.CustomAuthenticationProvider;
import com.template.business.auth.security.JwtUtil;
import com.template.business.auth.service.DatabaseUserDetailsService;
import com.template.business.auth.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

/**
 * REST controller for authentication and user management operations.
 *
 * <p>This controller handles:
 * <ul>
 *   <li>User login with JWT token generation</li>
 *   <li>User registration</li>
 *   <li>JWT token validation</li>
 *   <li>Health check endpoint</li>
 * </ul>
 *
 * <p>Authentication is performed via {@link CustomAuthenticationProvider} which supports
 * both LDAP (Active Directory) and database-based authentication. Roles are always loaded
 * from the database regardless of authentication method.
 *
 * @author Template Business
 * @version 1.0
 * @see CustomAuthenticationProvider
 * @see JwtUtil
 */
@Slf4j
@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
public class AuthController {

    private final CustomAuthenticationProvider authenticationProvider;
    private final DatabaseUserDetailsService databaseUserDetailsService;
    private final UserService userService;
    private final JwtUtil jwtUtil;

    @Value("${ldap.enabled}")
    private boolean ldapEnabled;

    /**
     * Authenticates a user and returns a JWT token.
     *
     * <p>Authentication flow:
     * <ol>
     *   <li>Attempts LDAP authentication if enabled</li>
     *   <li>Falls back to database authentication if LDAP fails or is disabled</li>
     *   <li>Loads user details and roles from database</li>
     *   <li>Generates JWT token with roles</li>
     *   <li>Returns complete user profile with authentication method indicator</li>
     * </ol>
     *
     * @param request login credentials containing username, password, and optional entityCode
     * @return {@link ApiResponse} containing {@link LoginResponse} with JWT token and user data
     */
    @PostMapping("/login")
    public ResponseEntity<ApiResponse<LoginResponse>> login(@Valid @RequestBody LoginRequest request) {
        try {
            log.info("Login attempt for user: {}", request.getUsername());

            // Authenticate using custom provider (LDAP + DB fallback)
            Authentication authentication = authenticationProvider.authenticate(
                new UsernamePasswordAuthenticationToken(request.getUsername(), request.getPassword())
            );

            // Determine which authentication method was used
            // The authentication object's details contain info about the auth method
            String authMethod = determineAuthMethod(authentication);

            // Get user details from database (needed for response and roles)
            User user = databaseUserDetailsService.getUserByUsername(request.getUsername());

            // Extract roles - prioritize database roles if user exists
            List<String> roles;

            if (user != null && user.getUserRoles() != null && !user.getUserRoles().isEmpty()) {
                // LDAP is only for authentication - roles ALWAYS come from database
                if (request.getEntityCode() != null) {
                    // Filter roles by specific entity
                    roles = user.getUserRoles().stream()
                            .filter(ur -> "ACTIVE".equals(ur.getStatus()))
                            .filter(ur -> request.getEntityCode().equals(ur.getId().getEntity()))
                            .map(ur -> ur.getId().getRole())
                            .distinct()
                            .collect(Collectors.toList());
                } else {
                    // Return all active roles from all entities
                    roles = user.getUserRoles().stream()
                            .filter(ur -> "ACTIVE".equals(ur.getStatus()))
                            .map(ur -> ur.getId().getRole())
                            .distinct()
                            .collect(Collectors.toList());
                }
            } else {
                // Fallback to authentication authorities (only if user not in database)
                roles = authentication.getAuthorities().stream()
                        .map(GrantedAuthority::getAuthority)
                        .collect(Collectors.toList());
            }

            // Generate JWT token
            String token = jwtUtil.generateToken(request.getUsername(), roles);

            // Build response - ALWAYS include all user data from database (if available)
            LoginResponse.LoginResponseBuilder responseBuilder = LoginResponse.builder()
                    .token(token)
                    .type("Bearer")
                    .username(request.getUsername())
                    .roles(roles)
                    .authenticationMethod(authMethod);

            // Add user details from database (for both LDAP and DATABASE auth)
            if (user != null) {
                responseBuilder
                        .email(user.getEmail())
                        .firstName(user.getFirstName())
                        .lastName(user.getLastName())
                        .company(user.getCompany())
                        .theme(user.getTheme())
                        .image(user.getImage());
            }

            LoginResponse loginResponse = responseBuilder.build();

            log.info("User {} logged in successfully via {} - Data source: {}",
                    request.getUsername(),
                    authMethod,
                    user != null ? "DATABASE" : "AUTHENTICATION_PROVIDER");

            return ResponseEntity.ok(ApiResponse.success("Login successful", loginResponse));

        } catch (Exception e) {
            log.error("Login failed for user {}: {}", request.getUsername(), e.getMessage());
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(ApiResponse.error("Invalid username or password"));
        }
    }

    /**
     * Registers a new user in the system.
     *
     * <p>Creates a new user account with BCrypt password encryption.
     * User status is set to ACTIVE by default.
     *
     * @param request registration details including username, password, and profile information
     * @return {@link ApiResponse} containing the created {@link User} object
     */
    @PostMapping("/register")
    public ResponseEntity<ApiResponse<User>> register(@Valid @RequestBody UserRegistrationRequest request) {
        try {
            log.info("Registration attempt for user: {}", request.getUsername());

            if (userService.existsByUsername(request.getUsername())) {
                return ResponseEntity.status(HttpStatus.CONFLICT)
                        .body(ApiResponse.error("Username already exists"));
            }

            User user = userService.registerUser(request);
            log.info("User {} registered successfully", request.getUsername());

            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(ApiResponse.success("User registered successfully", user));

        } catch (Exception e) {
            log.error("Registration failed for user {}: {}", request.getUsername(), e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.error("Registration failed: " + e.getMessage()));
        }
    }

    /**
     * Validates a JWT token.
     *
     * <p>Extracts the token from the Authorization header and checks if it's valid
     * and not expired.
     *
     * @param authHeader the Authorization header containing the Bearer token
     * @return {@link ApiResponse} with boolean indicating token validity
     */
    @GetMapping("/validate")
    public ResponseEntity<ApiResponse<Boolean>> validateToken(@RequestHeader("Authorization") String authHeader) {
        try {
            if (authHeader != null && authHeader.startsWith("Bearer ")) {
                String token = authHeader.substring(7);
                boolean isValid = jwtUtil.validateToken(token);
                return ResponseEntity.ok(ApiResponse.success("Token validation result", isValid));
            }
            return ResponseEntity.ok(ApiResponse.success("Token validation result", false));
        } catch (Exception e) {
            return ResponseEntity.ok(ApiResponse.success("Token validation result", false));
        }
    }

    /**
     * Health check endpoint.
     *
     * <p>Returns service status and LDAP configuration state.
     * Useful for monitoring and load balancers.
     *
     * @return {@link ApiResponse} with health status message
     */
    @GetMapping("/health")
    public ResponseEntity<ApiResponse<String>> health() {
        String ldapStatus = ldapEnabled ? "enabled" : "disabled";
        return ResponseEntity.ok(ApiResponse.success(
                "Auth service is running. LDAP is " + ldapStatus,
                "healthy"
        ));
    }

    /**
     * Determine which authentication method was actually used
     * by examining the authentication object
     *
     * @param authentication The authentication object from Spring Security
     * @return "LDAP" if LDAP was used, "DATABASE" if database was used
     */
    private String determineAuthMethod(Authentication authentication) {
        // The CustomAuthenticationProvider returns different authentication types:
        // - LDAP auth returns an authentication from LdapAuthenticationProvider
        // - Database auth returns UsernamePasswordAuthenticationToken with UserDetails as principal

        // Check the principal type - if it's UserDetails from our DatabaseUserDetailsService,
        // it means database authentication was used
        Object principal = authentication.getPrincipal();
        if (principal instanceof org.springframework.security.core.userdetails.User) {
            // This is from our DatabaseUserDetailsService
            return "DATABASE";
        }

        // Check if the authentication class name contains "Ldap"
        String authClassName = authentication.getClass().getSimpleName();
        if (authClassName.contains("Ldap")) {
            return "LDAP";
        }

        // Fallback: check if LDAP is enabled - if so, assume LDAP was used
        // (since database auth would have UserDetails as principal)
        if (ldapEnabled) {
            return "LDAP";
        }

        // Default to DATABASE
        return "DATABASE";
    }
}
