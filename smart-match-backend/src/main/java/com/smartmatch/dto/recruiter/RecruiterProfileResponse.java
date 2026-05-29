package com.smartmatch.dto.recruiter;

import java.time.Instant;

public record RecruiterProfileResponse(
        String id,
        String userId,
        String companyId,
        String position,
        String phone,
        Instant createdAt,
        Instant updatedAt
) {
}
