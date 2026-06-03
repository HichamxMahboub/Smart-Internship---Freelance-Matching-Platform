package com.smartmatch.dto.application;

import com.smartmatch.model.enums.ApplicationStatus;

import java.time.Instant;

/**
 * Admin/recruiter friendly application view: includes display names so the UI
 * doesn't show raw ids.
 */
public record ApplicationOverviewResponse(
        String id,
        String offerId,
        String offerTitle,
        String candidateId,
        String candidateName,
        String candidateEmail,
        String recruiterId,
        String recruiterName,
        String companyName,
        String message,
        ApplicationStatus status,
        Double matchingScore,
        Instant appliedAt,
        Instant reviewedAt,
        Instant decidedAt,
        Instant updatedAt
) {
}
