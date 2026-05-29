package com.smartmatch.dto;

import com.smartmatch.model.enums.ApplicationStatus;
import jakarta.validation.constraints.NotNull;

public record ApplicationStatusRequest(
        @NotNull ApplicationStatus status
) {
}
