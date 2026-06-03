package com.smartmatch.dto.recruiter;

import java.time.Instant;

public record RecruiterProfileResponse(
        String id,
        String userId,
        String companyId,
        String photoUrl,
        String headline,
        String bio,
        String linkedin,
        String position,
        String phone,
        Instant createdAt,
        Instant updatedAt
) {
}
