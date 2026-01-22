package com.template.business.auth.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Date;

/**
 * DTO for mailing/email queue administration (read-only)
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MailingDTO {

    private Long id;
    private String subject;
    private String body;
    private String attachment;
    private String sent; // Y/N
    private Date notBefore;
    private String mailingList;
    private String mailType;
    private Date createDate;
    private String createUser;
}
