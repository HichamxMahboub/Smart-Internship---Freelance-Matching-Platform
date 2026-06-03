package com.smartmatch.dto.recruiter;

import jakarta.validation.constraints.Size;

public record RecruiterProfileRequest(
        String companyId,
        String photoUrl,
        @Size(max = 160) String headline,
        @Size(max = 2000) String bio,
        String linkedin,
        @Size(max = 120) String position,
        @Size(max = 40) String phone
) {
}
