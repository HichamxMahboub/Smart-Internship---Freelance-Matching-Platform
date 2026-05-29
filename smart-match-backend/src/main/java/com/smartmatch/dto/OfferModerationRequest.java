package com.smartmatch.dto;

import com.smartmatch.model.enums.OfferStatus;
import jakarta.validation.constraints.NotNull;

public record OfferModerationRequest(
        @NotNull OfferStatus status,
        String description
) {
}
