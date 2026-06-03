package com.smartmatch.dto.candidate;

public record CvAutofillResponse(
        CandidateProfileResponse profile,
        boolean aiUsed,
        String source,
        int extractedSkills,
        int extractedExperiences,
        int extractedEducations
) {
}
