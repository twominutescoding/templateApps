package com.template.business.auth.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO for updating user theme preferences
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ThemePreferencesRequest {

    @NotBlank(message = "Theme is required")
    private String theme; // light or dark

    @NotBlank(message = "Palette ID is required")
    private String paletteId; // Color palette ID (e.g., ocean-blue, sunset-orange, custom-uuid)
}
