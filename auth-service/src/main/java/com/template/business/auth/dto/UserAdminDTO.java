package com.template.business.auth.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Date;
import java.util.List;

/**
 * DTO for user administration
 * Contains user details and associated roles
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserAdminDTO {
    private String username;
    private String firstName;
    private String lastName;
    private String email;
    private String company;
    private String status;
    private String theme;
    private String paletteId;
    private String image;
    private Date createDate;
    private String createUser;
    private List<UserRoleDTO> roles;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class UserRoleDTO {
        private String role;
        private String entity;
        private String description;
        private String status;
    }
}
