package com.template.business.service;

import com.template.business.dto.ExternalAuthResponse;
import com.template.business.dto.LoginResponse;
import com.template.business.entity.User;
import com.template.business.repository.UserRepository;
import com.template.business.security.JwtUtil;
import io.jsonwebtoken.Claims;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;

import java.util.HashSet;
import java.util.Set;

/**
 * Authentication service that handles both local and external authentication
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class AuthService {

    private final AuthenticationManager authenticationManager;
    private final JwtUtil jwtUtil;
    private final UserRepository userRepository;

    @Value("${auth.external.enabled:false}")
    private boolean externalAuthEnabled;

    @Autowired(required = false)
    private ExternalAuthService externalAuthService;

    /**
     * Authenticate user and return login response with JWT token
     *
     * @param username Username
     * @param password Password
     * @return LoginResponse with JWT token and user details
     */
    public LoginResponse authenticate(String username, String password) {
        if (externalAuthEnabled && externalAuthService != null) {
            log.info("Using external authentication for user: {}", username);
            return authenticateWithExternalService(username, password);
        } else {
            log.info("Using local authentication for user: {}", username);
            return authenticateLocally(username, password);
        }
    }

    /**
     * Local authentication (current behavior - database validation)
     */
    private LoginResponse authenticateLocally(String username, String password) {
        // Authenticate with Spring Security
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(username, password)
        );

        UserDetails userDetails = (UserDetails) authentication.getPrincipal();
        String token = jwtUtil.generateToken(userDetails);

        // Get user from database
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        return LoginResponse.builder()
                .token(token)
                .type("Bearer")
                .id(user.getId())
                .username(user.getUsername())
                .email(user.getEmail())
                .roles(user.getRoles())
                .build();
    }

    /**
     * External authentication (auth-service)
     */
    private LoginResponse authenticateWithExternalService(String username, String password) {
        try {
            // Call external auth service and get full response
            ExternalAuthResponse authResponse = externalAuthService.authenticate(username, password);
            ExternalAuthResponse.AuthData authData = authResponse.getData();

            // Try to find user in local database (for local user ID reference)
            User user = userRepository.findByUsername(authData.getUsername()).orElse(null);
            Long userId = user != null ? user.getId() : null;

            // Convert roles from List to Set
            Set<String> roles = authData.getRoles() != null
                ? new HashSet<>(authData.getRoles())
                : Set.of("USER");

            // Return the response using auth-service token and user data
            return LoginResponse.builder()
                    .token(authData.getToken())
                    .type(authData.getType())
                    .id(userId)
                    .username(authData.getUsername())
                    .email(authData.getEmail())
                    .roles(roles)
                    .build();

        } catch (Exception e) {
            log.error("External authentication failed for user {}: {}", username, e.getMessage());
            throw new RuntimeException("Authentication failed: " + e.getMessage());
        }
    }
}
