package com.smartmatch.dto;

import jakarta.validation.constraints.Size;

public record RecruiterProfileRequest(
        String companyId,
        @Size(max = 120) String position,
        @Size(max = 40) String phone
) {
}
