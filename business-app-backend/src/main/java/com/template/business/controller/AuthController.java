package com.template.business.controller;

import com.template.business.dto.ApiResponse;
import com.template.business.dto.LoginRequest;
import com.template.business.dto.LoginResponse;
import com.template.business.dto.RefreshTokenRequest;
import com.template.business.dto.ThemePreferencesRequest;
import com.template.business.service.AuthService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * REST controller for authentication operations.
 *
 * <p>This controller proxies authentication requests to the external auth-service.
 * It handles:
 * <ul>
 *   <li>User login with credential forwarding to auth-service</li>
 *   <li>Token refresh via auth-service</li>
 *   <li>Theme preference updates</li>
 * </ul>
 *
 * <p>Note: This application does not manage users directly. All user management
 * is handled by the external auth-service.
 *
 * @author Template Business
 * @version 1.0
 */
@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
@Tag(name = "Authentication", description = "Authentication APIs. Proxies requests to external auth-service.")
public class AuthController {

    private final AuthService authService;

    @Operation(
        summary = "User login",
        description = "Authenticates user credentials via external auth-service. " +
                      "Returns JWT access token and refresh token on success."
    )
    @ApiResponses(value = {
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Login successful"),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "401", description = "Invalid credentials")
    })
    @PostMapping("/login")
    public ResponseEntity<ApiResponse<LoginResponse>> login(@Valid @RequestBody LoginRequest loginRequest) {
        LoginResponse loginResponse = authService.authenticate(
                loginRequest.getUsername(),
                loginRequest.getPassword(),
                loginRequest.getEntityCode()
        );

        return ResponseEntity.ok(ApiResponse.success("Login successful", loginResponse));
    }

    @Operation(
        summary = "Refresh access token",
        description = "Exchanges a valid refresh token for new access and refresh tokens via auth-service."
    )
    @ApiResponses(value = {
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Token refreshed successfully"),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "401", description = "Invalid or expired refresh token")
    })
    @PostMapping("/refresh")
    public ResponseEntity<ApiResponse<LoginResponse>> refresh(@Valid @RequestBody RefreshTokenRequest request) {
        LoginResponse loginResponse = authService.refreshToken(request.getRefreshToken());
        return ResponseEntity.ok(ApiResponse.success("Token refreshed successfully", loginResponse));
    }

    @Operation(
        summary = "Update theme preferences",
        description = "Updates the current user's theme (light/dark) and color palette preferences.",
        security = @SecurityRequirement(name = "bearerAuth")
    )
    @PutMapping("/theme")
    public ResponseEntity<ApiResponse<Void>> updateTheme(@Valid @RequestBody ThemePreferencesRequest request) {
        authService.updateThemePreferences(request.getTheme(), request.getPaletteId());
        return ResponseEntity.ok(ApiResponse.success("Theme preferences updated successfully", null));
    }
}
