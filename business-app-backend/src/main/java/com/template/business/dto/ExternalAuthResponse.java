package com.template.business.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;

import java.util.List;

/**
 * Response DTO from external authentication service
 * Maps to auth-service response format
 */
@Data
public class ExternalAuthResponse {
    private boolean success;
    private String message;
    private AuthData data;

    @Data
    public static class AuthData {
        private String token;           // Used by login endpoint
        private String accessToken;     // Used by refresh endpoint
        private String refreshToken;
        private String type;
        private String username;
        private String email;
        private String firstName;
        private String lastName;
        private String company;
        private String theme;
        private String paletteId;
        private String image;
        private List<String> roles;
        private String authenticationMethod;

        /**
         * Get the access token - handles both login (token) and refresh (accessToken) responses
         */
        public String getToken() {
            return token != null ? token : accessToken;
        }
    }

    // For backward compatibility
    public String getAccessToken() {
        return data != null ? data.getToken() : null;
    }
}
