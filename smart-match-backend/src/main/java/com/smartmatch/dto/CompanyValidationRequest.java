package com.smartmatch.dto;

import com.smartmatch.model.enums.ValidationStatus;
import jakarta.validation.constraints.NotNull;

public record CompanyValidationRequest(
        @NotNull ValidationStatus validationStatus,
        String description
) {
}
