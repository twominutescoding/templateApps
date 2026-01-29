package com.template.business.auth.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LoginResponse {

    private String token; // Access token (JWT)
    private String refreshToken; // Refresh token for getting new access tokens
    @Builder.Default
    private String type = "Bearer";
    private String username;
    private String email;
    private String firstName;
    private String lastName;
    private String company;
    private String theme;
    private String paletteId;
    private List<String> roles;
    private String authenticationMethod; // LDAP or DATABASE
}
