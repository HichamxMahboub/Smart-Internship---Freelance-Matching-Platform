package com.smartmatch.dto;

import java.time.Instant;

public record AnalyticsResponse(
        String id,
        long totalUsers,
        long totalCandidates,
        long totalRecruiters,
        long totalOffers,
        long totalApplications,
        long totalPremiumUsers,
        Instant generatedAt
) {
}
