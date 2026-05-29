package com.smartmatch.dto.offer;

import com.smartmatch.model.enums.OfferStatus;
import com.smartmatch.model.enums.OfferType;

import java.time.Instant;
import java.util.List;

public record OfferResponse(
        String id,
        String companyId,
        String title,
        String description,
        OfferType type,
        String location,
        String duration,
        List<String> requiredSkills,
        OfferStatus status,
        Instant publishedAt,
        Instant archiveAt,
        Instant createdAt,
        Instant updatedAt
) {
}
