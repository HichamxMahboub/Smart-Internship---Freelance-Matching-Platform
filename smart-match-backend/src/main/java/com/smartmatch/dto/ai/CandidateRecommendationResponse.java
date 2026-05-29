package com.smartmatch.dto.ai;

import com.smartmatch.dto.application.ApplicationResponse;

public record CandidateRecommendationResponse(
        ApplicationResponse application,
        Double matchingScore
) {
}
