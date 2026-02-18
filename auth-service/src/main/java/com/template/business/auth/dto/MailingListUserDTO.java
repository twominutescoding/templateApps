package com.template.business.auth.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Date;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MailingListUserDTO {

    private String name;
    private String username;
    private String firstName;
    private String lastName;
    private String email;
    private Date createDate;
    private String createUser;
}
