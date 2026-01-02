package com.template.business.auth.dto;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Request to revoke a specific session
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class RevokeSessionRequest {

    @NotNull(message = "Session ID is required")
    private Long sessionId;
}
