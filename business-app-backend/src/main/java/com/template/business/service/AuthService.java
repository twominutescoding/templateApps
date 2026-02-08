package com.template.business.service;

import com.template.business.dto.ExternalAuthResponse;
import com.template.business.dto.LoginResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

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

        // Get roles or default to USER
        List<String> roles = authData.getRoles() != null
            ? authData.getRoles()
            : List.of("USER");

        // Return the response using auth-service token and user data
        return LoginResponse.builder()
                .token(authData.getToken())
                .refreshToken(authData.getRefreshToken())
                .type(authData.getType())
                .username(authData.getUsername())
                .email(authData.getEmail())
                .firstName(authData.getFirstName())
                .lastName(authData.getLastName())
                .company(authData.getCompany())
                .theme(authData.getTheme())
                .paletteId(authData.getPaletteId())
                .image(authData.getImage())
                .roles(roles)
                .authenticationMethod(authData.getAuthenticationMethod())
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

        // Get roles or default to USER
        List<String> roles = authData.getRoles() != null
            ? authData.getRoles()
            : List.of("USER");

        return LoginResponse.builder()
                .token(authData.getToken())
                .refreshToken(authData.getRefreshToken())
                .type(authData.getType())
                .username(authData.getUsername())
                .email(authData.getEmail())
                .firstName(authData.getFirstName())
                .lastName(authData.getLastName())
                .company(authData.getCompany())
                .theme(authData.getTheme())
                .paletteId(authData.getPaletteId())
                .image(authData.getImage())
                .roles(roles)
                .authenticationMethod(authData.getAuthenticationMethod())
                .build();
    }
}
