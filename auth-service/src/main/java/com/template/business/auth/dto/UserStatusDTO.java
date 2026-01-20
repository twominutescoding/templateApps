package com.template.business.auth.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Date;

/**
 * DTO for user status lookup (D_USER_STATUS table)
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserStatusDTO {

    private String status;
    private String description;
    private Date createDate;
    private String createUser;
}
