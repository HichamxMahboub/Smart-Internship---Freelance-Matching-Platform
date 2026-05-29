package com.smartmatch.dto;

import jakarta.validation.constraints.Size;

import java.util.List;

public record CandidateProfileRequest(
        @Size(max = 120) String educationLevel,
        @Size(max = 120) String fieldOfStudy,
        @Size(max = 120) String location,
        String cvUrl,
        List<String> skills,
        List<String> languages,
        List<String> preferences
) {
}
