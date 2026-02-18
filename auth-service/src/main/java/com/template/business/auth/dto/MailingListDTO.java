package com.template.business.auth.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Date;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MailingListDTO {

    private String name;
    private String description;
    private String status;
    private Date createDate;
    private String createUser;
    private int userCount;
    private List<MailingListUserDTO> users;
}
