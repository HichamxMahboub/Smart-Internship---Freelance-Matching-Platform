package com.smartmatch.dto.admin;

import com.smartmatch.dto.ai.AIResultResponse;
import com.smartmatch.dto.candidate.CandidateProfileResponse;
import com.smartmatch.dto.company.CompanyResponse;
import com.smartmatch.dto.recruiter.RecruiterProfileResponse;
import com.smartmatch.dto.user.UserResponse;

import java.util.List;

public record AdminUserDetailResponse(
        UserResponse user,
        CandidateProfileResponse candidateProfile,
        RecruiterProfileResponse recruiterProfile,
        CompanyResponse company,
        List<AIResultResponse> aiResults
) {
}
