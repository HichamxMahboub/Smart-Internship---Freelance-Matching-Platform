package com.smartmatch.service;

import com.smartmatch.dto.ai.AIJobRequest;
import com.smartmatch.dto.ai.AIResultResponse;
import com.smartmatch.dto.ai.CandidateRecommendationResponse;
import com.smartmatch.dto.application.ApplicationResponse;
import com.smartmatch.exception.BadRequestException;
import com.smartmatch.exception.ForbiddenException;
import com.smartmatch.exception.NotFoundException;
import com.smartmatch.model.AIResult;
import com.smartmatch.model.Application;
import com.smartmatch.model.CandidateProfile;
import com.smartmatch.model.Company;
import com.smartmatch.model.Notification;
import com.smartmatch.model.Offer;
import com.smartmatch.model.User;
import com.smartmatch.model.enums.AIResultType;
import com.smartmatch.model.enums.NotificationType;
import com.smartmatch.model.enums.OfferStatus;
import com.smartmatch.model.enums.Plan;
import com.smartmatch.model.enums.Role;
import com.smartmatch.repository.AIResultRepository;
import com.smartmatch.repository.ApplicationRepository;
import com.smartmatch.repository.CandidateProfileRepository;
import com.smartmatch.repository.CompanyRepository;
import com.smartmatch.repository.NotificationRepository;
import com.smartmatch.repository.OfferRepository;
import com.smartmatch.util.SecurityUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.util.Comparator;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Service
@RequiredArgsConstructor
public class AIService {
    private final AIResultRepository aiResultRepository;
    private final CandidateProfileRepository candidateProfileRepository;
    private final OfferRepository offerRepository;
    private final ApplicationRepository applicationRepository;
    private final CompanyRepository companyRepository;
    private final NotificationRepository notificationRepository;

    public AIResultResponse createJob(AIJobRequest request) {
        User user = requirePremiumOrAdmin();
        AIResult result = switch (request.type()) {
            case CV_ANALYSIS -> createCvAnalysis(user, request);
            case OFFER_RECOMMENDATION -> createOfferRecommendation(user, request);
            case CANDIDATE_RECOMMENDATION -> createCandidateRecommendation(user, request);
            case PROFILE_OPTIMIZATION -> createProfileOptimization(user, request);
        };

        AIResult savedResult = aiResultRepository.save(result);
        notificationRepository.save(Notification.builder()
                .userId(user.getId())
                .title("AI result ready")
                .message("Your " + request.type().name() + " result is ready.")
                .type(NotificationType.AI)
                .read(false)
                .build());
        return toResponse(savedResult);
    }

    public AIResultResponse getResult(String id) {
        User user = requirePremiumOrAdmin();
        AIResult result = aiResultRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("AI result not found with id: " + id));
        if (user.getRole() != Role.ADMIN && !result.getUserId().equals(user.getId())) {
            throw new ForbiddenException("You can only view your own AI results");
        }
        return toResponse(result);
    }

    public List<CandidateRecommendationResponse> getCandidateRecommendations(String offerId) {
        User user = requirePremiumOrAdmin();
        Offer offer = offerRepository.findById(offerId)
                .orElseThrow(() -> new NotFoundException("Offer not found with id: " + offerId));
        if (user.getRole() == Role.RECRUITER) {
            Company company = companyRepository.findById(offer.getCompanyId())
                    .orElseThrow(() -> new NotFoundException("Company not found for offer"));
            if (!company.getRecruiterId().equals(user.getId())) {
                throw new ForbiddenException("You can only request recommendations for your own offers");
            }
        }

        return applicationRepository.findByOfferIdAndCandidateId(offerId, "__never__").stream()
                .map(application -> toCandidateRecommendation(application, offer))
                .toList();
    }

    public List<CandidateRecommendationResponse> getCandidateRecommendationsForOffer(String offerId) {
        User user = requirePremiumOrAdmin();
        Offer offer = offerRepository.findById(offerId)
                .orElseThrow(() -> new NotFoundException("Offer not found with id: " + offerId));
        if (user.getRole() == Role.RECRUITER) {
            Company company = companyRepository.findById(offer.getCompanyId())
                    .orElseThrow(() -> new NotFoundException("Company not found for offer"));
            if (!company.getRecruiterId().equals(user.getId())) {
                throw new ForbiddenException("You can only request recommendations for your own offers");
            }
        }
        return applicationRepository.findByOfferIdIn(List.of(offerId)).stream()
                .map(application -> toCandidateRecommendation(application, offer))
                .sorted(Comparator.comparing(CandidateRecommendationResponse::matchingScore).reversed())
                .toList();
    }

    public double calculateMatchingScore(List<String> candidateSkills, List<String> requiredSkills) {
        if (requiredSkills == null || requiredSkills.isEmpty()) {
            return 100.0;
        }
        Set<String> normalizedCandidateSkills = normalize(candidateSkills);
        long matches = requiredSkills.stream()
                .filter(StringUtils::hasText)
                .map(skill -> skill.trim().toLowerCase())
                .filter(normalizedCandidateSkills::contains)
                .count();
        return Math.round((matches * 10000.0) / requiredSkills.size()) / 100.0;
    }

    private AIResult createCvAnalysis(User user, AIJobRequest request) {
        CandidateProfile profile = getCandidateProfile(user.getId());
        double score = profile.getSkills() == null || profile.getSkills().isEmpty() ? 25.0 : Math.min(95.0, 45.0 + profile.getSkills().size() * 8.0);
        return AIResult.builder()
                .userId(user.getId())
                .offerId(request.offerId())
                .applicationId(request.applicationId())
                .type(AIResultType.CV_ANALYSIS)
                .score(score)
                .extractedSkills(safeList(profile.getSkills()))
                .recommendation("Your CV highlights " + safeList(profile.getSkills()).size() + " skills. Add measurable projects and recent experience to improve recruiter confidence.")
                .details("Simulated CV analysis based on candidate profile skills.")
                .build();
    }

    private AIResult createOfferRecommendation(User user, AIJobRequest request) {
        CandidateProfile profile = getCandidateProfile(user.getId());
        List<Offer> publishedOffers = offerRepository.findByStatus(OfferStatus.PUBLISHED);
        String details = publishedOffers.stream()
                .map(offer -> offer.getTitle() + " = " + calculateMatchingScore(profile.getSkills(), offer.getRequiredSkills()) + "%")
                .limit(10)
                .toList()
                .toString();
        double bestScore = publishedOffers.stream()
                .mapToDouble(offer -> calculateMatchingScore(profile.getSkills(), offer.getRequiredSkills()))
                .max()
                .orElse(0.0);
        return AIResult.builder()
                .userId(user.getId())
                .type(AIResultType.OFFER_RECOMMENDATION)
                .score(bestScore)
                .extractedSkills(safeList(profile.getSkills()))
                .recommendation("Best published offers are ranked by overlap between your skills and required skills.")
                .details(details)
                .build();
    }

    private AIResult createCandidateRecommendation(User user, AIJobRequest request) {
        if (user.getRole() != Role.ADMIN && user.getRole() != Role.RECRUITER) {
            throw new ForbiddenException("Only recruiters or admins can request candidate recommendations");
        }
        if (!StringUtils.hasText(request.offerId())) {
            throw new BadRequestException("offerId is required for candidate recommendations");
        }
        List<CandidateRecommendationResponse> recommendations = getCandidateRecommendationsForOffer(request.offerId());
        double bestScore = recommendations.stream()
                .mapToDouble(CandidateRecommendationResponse::matchingScore)
                .max()
                .orElse(0.0);
        return AIResult.builder()
                .userId(user.getId())
                .offerId(request.offerId())
                .applicationId(request.applicationId())
                .type(AIResultType.CANDIDATE_RECOMMENDATION)
                .score(bestScore)
                .recommendation("Candidates are ranked by skill overlap with the offer requirements.")
                .details("Recommended candidates: " + recommendations.size())
                .build();
    }

    private AIResult createProfileOptimization(User user, AIJobRequest request) {
        CandidateProfile profile = candidateProfileRepository.findByUserId(user.getId()).orElse(null);
        StringBuilder suggestions = new StringBuilder();
        int missing = 0;
        if (profile == null || !StringUtils.hasText(profile.getEducationLevel())) { suggestions.append("Add your education level. "); missing++; }
        if (profile == null || !StringUtils.hasText(profile.getFieldOfStudy())) { suggestions.append("Add your field of study. "); missing++; }
        if (profile == null || !StringUtils.hasText(profile.getLocation())) { suggestions.append("Add your location. "); missing++; }
        if (profile == null || !StringUtils.hasText(profile.getCvUrl())) { suggestions.append("Upload your CV. "); missing++; }
        if (profile == null || profile.getSkills() == null || profile.getSkills().isEmpty()) { suggestions.append("Add at least five relevant skills. "); missing++; }
        if (suggestions.isEmpty()) {
            suggestions.append("Your profile is complete. Keep skills and CV updated.");
        }
        return AIResult.builder()
                .userId(user.getId())
                .offerId(request.offerId())
                .applicationId(request.applicationId())
                .type(AIResultType.PROFILE_OPTIMIZATION)
                .score(Math.max(10.0, 100.0 - missing * 15.0))
                .extractedSkills(profile == null ? List.of() : safeList(profile.getSkills()))
                .recommendation(suggestions.toString().trim())
                .details("Simulated profile optimization based on missing candidate profile fields.")
                .build();
    }

    private CandidateRecommendationResponse toCandidateRecommendation(Application application, Offer offer) {
        CandidateProfile profile = candidateProfileRepository.findByUserId(application.getCandidateId()).orElse(null);
        double score = calculateMatchingScore(profile == null ? List.of() : profile.getSkills(), offer.getRequiredSkills());
        application.setMatchingScore(score);
        applicationRepository.save(application);
        ApplicationResponse response = new ApplicationResponse(
                application.getId(),
                application.getOfferId(),
                application.getCandidateId(),
                application.getRecruiterId(),
                application.getMessage(),
                application.getStatus(),
                application.getMatchingScore(),
                application.getAppliedAt(),
                application.getUpdatedAt()
        );
        return new CandidateRecommendationResponse(response, score);
    }

    private User requirePremiumOrAdmin() {
        User user = SecurityUtils.currentUser();
        if (user.getRole() != Role.ADMIN && user.getPlan() != Plan.PREMIUM) {
            throw new ForbiddenException("Premium plan is required to use AI features");
        }
        return user;
    }

    private CandidateProfile getCandidateProfile(String userId) {
        return candidateProfileRepository.findByUserId(userId)
                .orElseThrow(() -> new NotFoundException("Candidate profile not found for current user"));
    }

    private Set<String> normalize(List<String> values) {
        Set<String> normalized = new HashSet<>();
        if (values != null) {
            values.stream()
                    .filter(StringUtils::hasText)
                    .map(value -> value.trim().toLowerCase())
                    .forEach(normalized::add);
        }
        return normalized;
    }

    private List<String> safeList(List<String> values) {
        return values == null ? List.of() : values;
    }

    private AIResultResponse toResponse(AIResult result) {
        return new AIResultResponse(
                result.getId(),
                result.getUserId(),
                result.getOfferId(),
                result.getApplicationId(),
                result.getType(),
                result.getScore(),
                safeList(result.getExtractedSkills()),
                result.getRecommendation(),
                result.getDetails(),
                result.getCreatedAt()
        );
    }
}
