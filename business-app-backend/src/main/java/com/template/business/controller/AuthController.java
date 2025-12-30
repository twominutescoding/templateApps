package com.template.business.controller;

import com.template.business.dto.ApiResponse;
import com.template.business.dto.LoginRequest;
import com.template.business.dto.LoginResponse;
import com.template.business.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<LoginResponse>> login(@Valid @RequestBody LoginRequest loginRequest) {
        LoginResponse loginResponse = authService.authenticate(
                loginRequest.getUsername(),
                loginRequest.getPassword()
        );

        return ResponseEntity.ok(ApiResponse.success("Login successful", loginResponse));
    }
}
