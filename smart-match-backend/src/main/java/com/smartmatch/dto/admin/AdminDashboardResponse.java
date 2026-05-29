package com.smartmatch.dto.admin;

import java.time.Instant;

public record AdminDashboardResponse(
        long totalUsers,
        long totalCandidates,
        long totalRecruiters,
        long totalOffers,
        long totalApplications,
        long totalPremiumUsers,
        long totalCompanies,
        long pendingCompanies,
        long publishedOffers,
        long pendingApplications,
        Instant generatedAt
) {
}
