package com.smartmatch.service;

import com.smartmatch.dto.admin.AdminUserDetailResponse;
import com.smartmatch.dto.admin.AdminUserOverviewResponse;
import com.smartmatch.dto.ai.AIResultResponse;
import com.smartmatch.dto.candidate.CandidateProfileResponse;
import com.smartmatch.dto.company.CompanyResponse;
import com.smartmatch.dto.recruiter.RecruiterProfileResponse;
import com.smartmatch.dto.user.UserResponse;
import com.smartmatch.exception.NotFoundException;
import com.smartmatch.model.AIResult;
import com.smartmatch.model.CandidateProfile;
import com.smartmatch.model.Company;
import com.smartmatch.model.RecruiterProfile;
import com.smartmatch.model.User;
import com.smartmatch.model.enums.AIResultType;
import com.smartmatch.model.enums.Role;
import com.smartmatch.repository.AIResultRepository;
import com.smartmatch.repository.CandidateProfileRepository;
import com.smartmatch.repository.CompanyRepository;
import com.smartmatch.repository.RecruiterProfileRepository;
import com.smartmatch.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.Comparator;
import java.util.List;

@Service
@RequiredArgsConstructor
public class AdminUserDetailService {
    private final UserRepository userRepository;
    private final CandidateProfileRepository candidateProfileRepository;
    private final RecruiterProfileRepository recruiterProfileRepository;
    private final CompanyRepository companyRepository;
    private final AIResultRepository aiResultRepository;

    public List<AdminUserOverviewResponse> getOverview() {
        return userRepository.findAll().stream()
                .filter(u -> u.getEmail() != null && !u.getEmail().isBlank())
                .sorted(Comparator.comparing(User::getCreatedAt, Comparator.nullsLast(Comparator.reverseOrder())))
                .map(this::toOverview)
                .toList();
    }

    private AdminUserOverviewResponse toOverview(User user) {
        if (user.getRole() == Role.CANDIDATE) {
            CandidateProfile profile = candidateProfileRepository.findByUserId(user.getId()).orElse(null);
            List<AIResult> ai = aiResultRepository.findByUserId(user.getId());
            Integer cvScore = ai.stream()
                    .filter(r -> r.getType() == AIResultType.CV_ANALYSIS && r.getScore() != null)
                    .sorted(Comparator.comparing(AIResult::getCreatedAt, Comparator.nullsLast(Comparator.reverseOrder())))
                    .findFirst()
                    .map(r -> (int) Math.round(r.getScore()))
                    .orElse(null);
            return new AdminUserOverviewResponse(
                    user.getId(), user.getFullName(), user.getEmail(), user.getRole(), user.getPlan(),
                    user.isActive(), user.isEmailVerified(), user.getCreatedAt(), user.getUpdatedAt(),
                    profile != null ? profile.getPhotoUrl() : null,
                    profile != null ? profile.getHeadline() : null,
                    profile != null ? profile.getLocation() : null,
                    profile != null ? profile.getCvUrl() : null,
                    profile != null ? sizeOf(profile.getSkillLevels(), profile.getSkills()) : 0,
                    profile != null ? sizeOfList(profile.getLanguages()) : 0,
                    profile != null ? sizeOfList(profile.getExperiences()) : 0,
                    profile != null ? sizeOfList(profile.getEducations()) : 0,
                    profile != null ? sizeOfList(profile.getProjects()) : 0,
                    ai.size(),
                    cvScore,
                    null, null);
        }
        if (user.getRole() == Role.RECRUITER) {
            String companyName = null;
            String companyLogo = null;
            Company company = companyRepository.findByRecruiterId(user.getId()).orElse(null);
            if (company != null) {
                companyName = company.getName();
                companyLogo = company.getLogoUrl();
            }
            RecruiterProfile rp = recruiterProfileRepository.findByUserId(user.getId()).orElse(null);
            return new AdminUserOverviewResponse(
                    user.getId(), user.getFullName(), user.getEmail(), user.getRole(), user.getPlan(),
                    user.isActive(), user.isEmailVerified(), user.getCreatedAt(), user.getUpdatedAt(),
                    rp != null ? rp.getPhotoUrl() : null,
                    rp != null ? rp.getHeadline() : null,
                    null, null, null, null, null, null, null, null, null,
                    companyName, companyLogo);
        }
        return new AdminUserOverviewResponse(
                user.getId(), user.getFullName(), user.getEmail(), user.getRole(), user.getPlan(),
                user.isActive(), user.isEmailVerified(), user.getCreatedAt(), user.getUpdatedAt(),
                null, null, null, null, null, null, null, null, null, null, null, null, null);
    }

    private int sizeOf(List<?> primary, List<?> fallback) {
        if (primary != null && !primary.isEmpty()) return primary.size();
        return fallback == null ? 0 : fallback.size();
    }

    private int sizeOfList(List<?> list) { return list == null ? 0 : list.size(); }

    public AdminUserDetailResponse getDetail(String userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new NotFoundException("User not found with id: " + userId));

        CandidateProfileResponse candidate = candidateProfileRepository.findByUserId(userId)
                .map(this::toCandidateResponse)
                .orElse(null);

        RecruiterProfile recruiterProfile = recruiterProfileRepository.findByUserId(userId).orElse(null);
        RecruiterProfileResponse recruiter = recruiterProfile != null ? toRecruiterResponse(recruiterProfile) : null;

        CompanyResponse company = null;
        if (recruiterProfile != null && recruiterProfile.getCompanyId() != null) {
            company = companyRepository.findById(recruiterProfile.getCompanyId())
                    .map(this::toCompanyResponse)
                    .orElse(null);
        }
        if (company == null) {
            company = companyRepository.findByRecruiterId(userId).map(this::toCompanyResponse).orElse(null);
        }

        List<AIResultResponse> ai = aiResultRepository.findByUserId(userId).stream()
                .sorted(Comparator.comparing(AIResult::getCreatedAt, Comparator.nullsLast(Comparator.reverseOrder())))
                .map(this::toAiResponse)
                .toList();

        return new AdminUserDetailResponse(toUserResponse(user), candidate, recruiter, company, ai);
    }

    private UserResponse toUserResponse(User u) {
        return new UserResponse(
                u.getId(), u.getFullName(), u.getEmail(), u.getRole(), u.getPlan(),
                u.isActive(), u.isEmailVerified(), u.getCreatedAt(), u.getUpdatedAt());
    }

    private CandidateProfileResponse toCandidateResponse(CandidateProfile p) {
        return new CandidateProfileResponse(
                p.getId(), p.getUserId(), p.getPhotoUrl(), p.getHeadline(), p.getBio(),
                p.getEducationLevel(), p.getFieldOfStudy(), p.getLocation(), p.getCvUrl(),
                safe(p.getSkills()), safe(p.getSkillLevels()), safe(p.getLanguages()), safe(p.getPreferences()),
                safe(p.getProjects()), safe(p.getExperiences()), safe(p.getEducations()),
                p.getSocials(), p.getCreatedAt(), p.getUpdatedAt());
    }

    private RecruiterProfileResponse toRecruiterResponse(RecruiterProfile r) {
        return new RecruiterProfileResponse(
                r.getId(), r.getUserId(), r.getCompanyId(), r.getPhotoUrl(), r.getHeadline(),
                r.getBio(), r.getLinkedin(), r.getPosition(), r.getPhone(),
                r.getCreatedAt(), r.getUpdatedAt());
    }

    private CompanyResponse toCompanyResponse(Company c) {
        return new CompanyResponse(
                c.getId(), c.getRecruiterId(), c.getName(), c.getSector(), c.getSize(),
                c.getLocation(), c.getDescription(), c.getLogoUrl(), c.getWebsite(),
                c.getValidationStatus(), c.getCreatedAt(), c.getUpdatedAt());
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
