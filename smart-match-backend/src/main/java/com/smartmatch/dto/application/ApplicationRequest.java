package com.smartmatch.dto.application;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record ApplicationRequest(
        @NotBlank String offerId,
        @Size(max = 2000) String message
) {
}
