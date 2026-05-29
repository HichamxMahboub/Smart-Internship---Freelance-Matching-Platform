package com.smartmatch.dto;

import com.smartmatch.model.enums.ValidationStatus;

import java.time.Instant;

public record CompanyResponse(
        String id,
        String recruiterId,
        String name,
        String sector,
        String description,
        String logoUrl,
        String website,
        ValidationStatus validationStatus,
        Instant createdAt,
        Instant updatedAt
) {
}
