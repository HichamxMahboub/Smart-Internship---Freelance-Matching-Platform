package com.smartmatch.dto.application;

import com.smartmatch.model.enums.ApplicationStatus;

import java.time.Instant;

public record ApplicationResponse(
        String id,
        String offerId,
        String candidateId,
        String recruiterId,
        String message,
        ApplicationStatus status,
        Double matchingScore,
        Instant appliedAt,
        Instant updatedAt
) {
}
