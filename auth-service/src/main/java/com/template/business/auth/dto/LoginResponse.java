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

    private String token;
    @Builder.Default
    private String type = "Bearer";
    private String username;
    private String email;
    private String firstName;
    private String lastName;
    private String company;
    private String theme;
    private String image;
    private List<String> roles;
    private String authenticationMethod; // LDAP or DATABASE
}
