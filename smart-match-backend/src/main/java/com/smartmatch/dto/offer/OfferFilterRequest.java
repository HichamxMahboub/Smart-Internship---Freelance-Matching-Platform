package com.smartmatch.dto.offer;

import com.smartmatch.model.enums.OfferStatus;
import com.smartmatch.model.enums.OfferType;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;

public record OfferFilterRequest(
        String keyword,
        OfferType type,
        String location,
        String skill,
        OfferStatus status,
        @Min(0) int page,
        @Min(1) @Max(100) int size
) {
    public OfferFilterRequest {
        if (size == 0) {
            size = 10;
        }
    }
}
