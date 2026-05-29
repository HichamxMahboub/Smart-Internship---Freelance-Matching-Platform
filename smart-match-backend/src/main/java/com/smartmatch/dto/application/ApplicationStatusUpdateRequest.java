package com.smartmatch.dto.application;

import com.smartmatch.model.enums.ApplicationStatus;
import jakarta.validation.constraints.NotNull;

public record ApplicationStatusUpdateRequest(
        @NotNull ApplicationStatus status
) {
}
