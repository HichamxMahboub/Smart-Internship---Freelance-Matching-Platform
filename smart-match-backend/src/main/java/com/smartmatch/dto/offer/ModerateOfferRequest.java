package com.smartmatch.dto.offer;

import com.smartmatch.model.enums.OfferStatus;
import jakarta.validation.constraints.NotNull;

public record ModerateOfferRequest(
        @NotNull OfferStatus status
) {
}
