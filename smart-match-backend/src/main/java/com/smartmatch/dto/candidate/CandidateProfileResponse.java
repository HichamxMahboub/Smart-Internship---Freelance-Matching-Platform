package com.smartmatch.dto.candidate;

import java.time.Instant;
import java.util.List;

public record CandidateProfileResponse(
        String id,
        String userId,
        String educationLevel,
        String fieldOfStudy,
        String location,
        String cvUrl,
        List<String> skills,
        List<String> languages,
        List<String> preferences,
        Instant createdAt,
        Instant updatedAt
) {
}
