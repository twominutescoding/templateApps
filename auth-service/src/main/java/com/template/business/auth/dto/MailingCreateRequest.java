package com.template.business.auth.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Date;

/**
 * DTO for creating a new mailing record in the queue
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MailingCreateRequest {

    @NotBlank(message = "Subject is required")
    private String subject;

    private String body;

    private String attachment;

    @NotBlank(message = "Mailing list is required")
    private String mailingList;

    @NotBlank(message = "Mail type is required")
    private String mailType;

    private Date notBefore; // If null, defaults to now (send immediately)
}
