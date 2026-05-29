package com.smartmatch.dto;

import jakarta.validation.constraints.NotNull;

public record StatusUpdateRequest(
        @NotNull Boolean active
) {
}
