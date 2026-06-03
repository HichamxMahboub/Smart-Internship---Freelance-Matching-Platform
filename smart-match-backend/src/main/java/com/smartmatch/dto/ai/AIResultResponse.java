package com.smartmatch.dto.ai;

import com.smartmatch.model.SkillLevel;
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
        List<SkillLevel> skillLevels,
        String profileType,
        String primaryStack,
        String seniority,
        String recommendation,
        String conclusion,
        String details,
        Instant createdAt
) {
}
