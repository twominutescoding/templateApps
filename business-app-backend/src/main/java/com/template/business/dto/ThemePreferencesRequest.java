package com.template.business.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class ThemePreferencesRequest {

    @NotBlank(message = "Theme is required")
    private String theme;

    @NotBlank(message = "Palette ID is required")
    private String paletteId;
}
