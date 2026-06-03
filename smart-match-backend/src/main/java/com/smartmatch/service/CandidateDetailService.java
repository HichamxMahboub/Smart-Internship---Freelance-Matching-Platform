package com.smartmatch.service;

import com.smartmatch.dto.ai.AIResultResponse;
import com.smartmatch.dto.candidate.CandidateDetailResponse;
import com.smartmatch.dto.candidate.CandidateProfileResponse;
import com.smartmatch.dto.user.UserResponse;
import com.smartmatch.exception.ForbiddenException;
import com.smartmatch.exception.NotFoundException;
import com.smartmatch.model.AIResult;
import com.smartmatch.model.Application;
import com.smartmatch.model.CandidateProfile;
import com.smartmatch.model.User;
import com.smartmatch.model.enums.Role;
import com.smartmatch.repository.AIResultRepository;
import com.smartmatch.repository.ApplicationRepository;
import com.smartmatch.repository.CandidateProfileRepository;
import com.smartmatch.repository.UserRepository;
import com.smartmatch.util.SecurityUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.Comparator;
import java.util.List;

@Service
@RequiredArgsConstructor
public class CandidateDetailService {
    private final UserRepository userRepository;
    private final CandidateProfileRepository candidateProfileRepository;
    private final AIResultRepository aiResultRepository;
    private final ApplicationRepository applicationRepository;

    public CandidateDetailResponse getCandidateDetail(String candidateId) {
        User viewer = SecurityUtils.currentUser();
        if (viewer.getRole() == Role.RECRUITER) {
            boolean hasApplication = applicationRepository.findByCandidateId(candidateId).stream()
                    .anyMatch(this::recruiterOwnsApplication);
            if (!hasApplication) {
                throw new ForbiddenException("Candidate has not applied to one of your offers");
            }
        } else if (viewer.getRole() != Role.ADMIN) {
            throw new ForbiddenException("Only recruiters or admins can view candidate details");
        }

        User candidate = userRepository.findById(candidateId)
                .orElseThrow(() -> new NotFoundException("Candidate not found with id: " + candidateId));
        if (candidate.getRole() != Role.CANDIDATE) {
            throw new NotFoundException("User is not a candidate");
        }

        CandidateProfileResponse profile = candidateProfileRepository.findByUserId(candidateId)
                .map(this::toProfileResponse)
                .orElse(null);

        List<AIResultResponse> ai = aiResultRepository.findByUserId(candidateId).stream()
                .sorted(Comparator.comparing(AIResult::getCreatedAt, Comparator.nullsLast(Comparator.reverseOrder())))
                .map(this::toAiResponse)
                .toList();

        return new CandidateDetailResponse(toUserResponse(candidate), profile, ai);
    }

    private boolean recruiterOwnsApplication(Application application) {
        User viewer = SecurityUtils.currentUser();
        return application.getRecruiterId() != null && application.getRecruiterId().equals(viewer.getId());
    }

    private UserResponse toUserResponse(User u) {
        return new UserResponse(
                u.getId(), u.getFullName(), u.getEmail(), u.getRole(), u.getPlan(),
                u.isActive(), u.isEmailVerified(), u.getCreatedAt(), u.getUpdatedAt());
    }

    private CandidateProfileResponse toProfileResponse(CandidateProfile p) {
        return new CandidateProfileResponse(
                p.getId(), p.getUserId(), p.getPhotoUrl(), p.getHeadline(), p.getBio(),
                p.getEducationLevel(), p.getFieldOfStudy(), p.getLocation(), p.getCvUrl(),
                safe(p.getSkills()), safe(p.getSkillLevels()), safe(p.getLanguages()), safe(p.getPreferences()),
                safe(p.getProjects()), safe(p.getExperiences()), safe(p.getEducations()),
                p.getSocials(), p.getCreatedAt(), p.getUpdatedAt());
    }

    private AIResultResponse toAiResponse(AIResult r) {
        return new AIResultResponse(
                r.getId(), r.getUserId(), r.getOfferId(), r.getApplicationId(),
                r.getType(), r.getScore(), safe(r.getExtractedSkills()), safe(r.getSkillLevels()),
                r.getProfileType(), r.getPrimaryStack(), r.getSeniority(),
                r.getRecommendation(), r.getConclusion(), r.getDetails(), r.getCreatedAt());
    }

    private <T> List<T> safe(List<T> v) { return v == null ? List.of() : v; }
}
