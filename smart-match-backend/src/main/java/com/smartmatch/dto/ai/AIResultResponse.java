package com.smartmatch.dto.ai;

import com.smartmatch.model.enums.AIResultType;

import java.time.Instant;
import java.util.List;

public record AIResultResponse(
        String id,
        String userId,
        String offerId,
        String applicationId,
        AIResultType type,
        Double score,
        List<String> extractedSkills,
        String recommendation,
        String details,
        Instant createdAt
) {
}
