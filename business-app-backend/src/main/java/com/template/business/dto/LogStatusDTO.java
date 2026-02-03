package com.template.business.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO for log status options from auth-service.
 * Used for dropdown lists when filtering logs by status.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LogStatusDTO {

    private String status;
    private Integer deleteAfter; // Number of days to keep logs with this status
}
