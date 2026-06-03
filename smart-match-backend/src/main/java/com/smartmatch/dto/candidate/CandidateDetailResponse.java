package com.smartmatch.dto.candidate;

import com.smartmatch.dto.ai.AIResultResponse;
import com.smartmatch.dto.user.UserResponse;

import java.util.List;

public record CandidateDetailResponse(
        UserResponse user,
        CandidateProfileResponse profile,
        List<AIResultResponse> aiResults
) {
}
