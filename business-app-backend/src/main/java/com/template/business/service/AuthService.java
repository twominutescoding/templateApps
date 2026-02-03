package com.template.business.service;

import com.template.business.dto.ExternalAuthResponse;
import com.template.business.dto.LoginResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.HashSet;
import java.util.Set;

/**
 * Authentication service - delegates all authentication to external auth-service
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class AuthService {

    private final ExternalAuthService externalAuthService;

    /**
     * Authenticate user via external auth-service
     *
     * @param username Username
     * @param password Password
     * @param entityCode Entity (application) code for multi-app support
     * @return LoginResponse with JWT token and user details from auth-service
     */
    public LoginResponse authenticate(String username, String password, String entityCode) {
        log.info("Authenticating user with external auth-service: {}", username);

        ExternalAuthResponse authResponse = externalAuthService.authenticate(username, password, entityCode);
        ExternalAuthResponse.AuthData authData = authResponse.getData();

        // Convert roles from List to Set
        Set<String> roles = authData.getRoles() != null
            ? new HashSet<>(authData.getRoles())
            : Set.of("USER");

        // Return the response using auth-service token and user data
        return LoginResponse.builder()
                .token(authData.getToken())
                .refreshToken(authData.getRefreshToken())
                .type(authData.getType())
                .id(null) // Auth-service doesn't provide numeric ID
                .username(authData.getUsername())
                .email(authData.getEmail())
                .roles(roles)
                .build();
    }

    /**
     * Refresh access token via external auth-service
     *
     * @param refreshTokenString Refresh token string
     * @return LoginResponse with new JWT token and user details from auth-service
     */
    public LoginResponse refreshToken(String refreshTokenString) {
        log.info("Refreshing token via external auth-service");

        ExternalAuthResponse authResponse = externalAuthService.refreshToken(refreshTokenString);
        ExternalAuthResponse.AuthData authData = authResponse.getData();

        // Convert roles from List to Set
        Set<String> roles = authData.getRoles() != null
            ? new HashSet<>(authData.getRoles())
            : Set.of("USER");

        return LoginResponse.builder()
                .token(authData.getToken())
                .refreshToken(authData.getRefreshToken())
                .type(authData.getType())
                .id(null)
                .username(authData.getUsername())
                .email(authData.getEmail())
                .roles(roles)
                .build();
    }
}
