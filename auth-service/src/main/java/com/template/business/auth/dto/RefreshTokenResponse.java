package com.template.business.auth.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * Response from refresh token endpoint
 * Contains new access token and new refresh token (token rotation)
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RefreshTokenResponse {

    private String accessToken;
    private String refreshToken;
    @Builder.Default
    private String type = "Bearer";
    private String username;
    private List<String> roles;
}
