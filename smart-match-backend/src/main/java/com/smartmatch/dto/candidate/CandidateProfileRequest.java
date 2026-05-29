package com.smartmatch.dto.candidate;

import jakarta.validation.constraints.Size;

import java.util.List;

public record CandidateProfileRequest(
        @Size(max = 120) String educationLevel,
        @Size(max = 120) String fieldOfStudy,
        @Size(max = 120) String location,
        String cvUrl,
        List<@Size(max = 80) String> skills,
        List<@Size(max = 80) String> languages,
        List<@Size(max = 120) String> preferences
) {
}
