package com.smartmatch.dto;

import com.smartmatch.model.enums.AIResultType;
import jakarta.validation.constraints.NotNull;

public record AIJobRequest(
        String offerId,
        String applicationId,
        @NotNull AIResultType type
) {
}
