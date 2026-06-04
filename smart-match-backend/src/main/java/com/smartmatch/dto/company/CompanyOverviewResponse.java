package com.smartmatch.dto.company;

import com.smartmatch.model.enums.ValidationStatus;

import java.time.Instant;

public record CompanyOverviewResponse(
        String id,
        String recruiterId,
        String name,
        String sector,
        String size,
        String location,
        String description,
        String logoUrl,
        String website,
        ValidationStatus validationStatus,
        Instant createdAt,
        Instant updatedAt,
        String recruiterName,
        String recruiterEmail,
        String recruiterPhotoUrl,
        long offerCount,
        long publishedOfferCount
) {
}
