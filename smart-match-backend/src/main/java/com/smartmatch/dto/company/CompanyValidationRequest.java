package com.smartmatch.dto.company;

import com.smartmatch.model.enums.ValidationStatus;
import jakarta.validation.constraints.NotNull;

public record CompanyValidationRequest(
        @NotNull ValidationStatus validationStatus,
        String description
) {
}
