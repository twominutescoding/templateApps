package com.template.business.auth.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO for log status dropdown options
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LogStatusDTO {

    private String status;
    private Integer deleteAfter; // Number of days to keep logs with this status
}
