package com.smartmatch.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "analytics")
public class Analytics {
    @Id
    private String id;

    private long totalUsers;
    private long totalCandidates;
    private long totalRecruiters;
    private long totalOffers;
    private long totalApplications;
    private long totalPremiumUsers;
    private long totalCompanies;
    private long pendingCompanies;
    private long publishedOffers;
    private long pendingApplications;
    private Instant generatedAt;
}
