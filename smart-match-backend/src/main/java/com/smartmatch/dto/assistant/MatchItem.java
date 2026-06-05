package com.smartmatch.dto.assistant;

import java.util.List;

/**
 * One AI match result. Returned by both the candidate matcher (offer fields populated) and the
 * recruiter matcher (candidate fields populated); the unused fields are null.
 */
public record MatchItem(
        String offerId,
        String candidateId,
        String title,
        String name,
        String company,
        String type,
        String headline,
        Integer score,
        List<String> reasons,
        List<String> gaps) {
}
