package com.smartmatch.dto.admin;

import com.smartmatch.model.enums.Plan;
import com.smartmatch.model.enums.Role;

import java.time.Instant;

/**
 * Lightweight admin roster card payload — one row per user with enough candidate
 * profile signals to render skills count, CV state, and the latest AI CV score
 * without a follow-up detail call.
 */
public record AdminUserOverviewResponse(
        String id,
        String fullName,
        String email,
        Role role,
        Plan plan,
        boolean active,
        boolean emailVerified,
        Instant createdAt,
        Instant updatedAt,
        // Candidate-only fields (null for recruiters/admins)
        String photoUrl,
        String headline,
        String location,
        String cvUrl,
        Integer skillCount,
        Integer languageCount,
        Integer experienceCount,
        Integer educationCount,
        Integer projectCount,
        Integer aiResultCount,
        Integer cvScore,
        // Recruiter-only fields
        String companyName,
        String companyLogoUrl
) {
}
