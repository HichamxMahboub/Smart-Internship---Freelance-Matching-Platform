package com.smartmatch.dto.ai;

import com.smartmatch.model.enums.AIResultType;
import jakarta.validation.constraints.NotNull;

public record AIJobRequest(
        @NotNull AIResultType type,
        String offerId,
        String applicationId
) {
}
