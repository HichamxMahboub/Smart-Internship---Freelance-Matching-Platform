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
import com.smartmatch.repository.OfferRepository;
import com.smartmatch.util.SecurityUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashSet;
import java.util.List;
import java.util.Locale;
import java.util.Set;

@Service
@RequiredArgsConstructor
public class AIService {
    /** Max offers/candidates scored with live LLM calls per job to keep latency and cost bounded. */
    private static final int AI_SCORE_LIMIT = 5;

    private final AIResultRepository aiResultRepository;
    private final CandidateProfileRepository candidateProfileRepository;
    private final OfferRepository offerRepository;
    private final ApplicationRepository applicationRepository;
    private final CompanyRepository companyRepository;
    private final NotificationService notificationService;
    private final AiMatchingClient aiMatchingClient;
    private final ResumeParserService resumeParserService;

    public AIResultResponse createJob(AIJobRequest request) {
        User user = requirePremiumOrAdmin();
        AIResult result = switch (request.type()) {
            case CV_ANALYSIS -> createCvAnalysis(user, request);
            case OFFER_RECOMMENDATION -> createOfferRecommendation(user, request);
            case CANDIDATE_RECOMMENDATION -> createCandidateRecommendation(user, request);
            case PROFILE_OPTIMIZATION -> createProfileOptimization(user, request);
        };

        AIResult savedResult = aiResultRepository.save(result);
        notificationService.create(
                user.getId(),
                "AI result ready",
                "Your " + request.type().name() + " result is ready.",
                NotificationType.AI);
        return toResponse(savedResult);
    }

    /**
     * Internal auto-trigger: runs CV analysis for the given user without the Premium gate.
     * Called after a candidate uploads/autofills a CV so the AI summary is ready without manual action.
     * Failures are swallowed (logged-only) so a slow/failed AI call never blocks the upload flow.
     */
    public AIResultResponse runCvAnalysisFor(User user) {
        try {
            AIJobRequest request = new AIJobRequest(AIResultType.CV_ANALYSIS, null, null);
            AIResult result = createCvAnalysis(user, request);
            AIResult saved = aiResultRepository.save(result);
            notificationService.create(
                    user.getId(),
                    "AI resume summary ready",
                    "We analysed your CV and your profile summary is ready.",
                    NotificationType.AI);
            return toResponse(saved);
        } catch (RuntimeException ex) {
            org.slf4j.LoggerFactory.getLogger(AIService.class)
                    .warn("Auto CV analysis failed for user {}: {}", user.getId(), ex.getMessage());
            return null;
        }
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

    /** Heuristic skill-overlap score used as the offline fallback when the LLM is disabled. */
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
        CandidateContext context = buildCandidateContext(profile);
        if (aiMatchingClient.isEnabled()) {
            AiMatchingClient.CvAnalysis analysis = aiMatchingClient.analyzeCv(context.text(), context.resumeParsed());
            List<String> skills = mergeSkills(profile.getSkills(), analysis.extractedSkills());
            List<com.smartmatch.model.SkillLevel> levels = toSkillLevels(analysis.skillLevels());

            // Mirror skill levels onto the candidate profile so recruiter views can show them.
            if (!levels.isEmpty()) {
                profile.setSkillLevels(mergeSkillLevels(profile.getSkillLevels(), levels));
                profile.setSkills(skills);
                candidateProfileRepository.save(profile);
            }

            return AIResult.builder()
                    .userId(user.getId())
                    .offerId(request.offerId())
                    .applicationId(request.applicationId())
                    .type(AIResultType.CV_ANALYSIS)
                    .score(analysis.score())
                    .extractedSkills(skills)
                    .skillLevels(levels)
                    .profileType(analysis.profileType())
                    .primaryStack(analysis.primaryStack())
                    .seniority(analysis.seniority())
                    .recommendation(analysis.recommendation())
                    .conclusion(analysis.conclusion())
                    .details(analysis.details())
                    .analysisSource(context.resumeParsed()
                            ? "Smart Match AI · resume + profile"
                            : "Smart Match AI · profile only")
                    .build();
        }
        List<String> skills = mergeSkills(profile.getSkills(), extractSkillsFromResumeText(context.resumeText()));
        double score = skills.isEmpty() ? 25.0 : Math.min(95.0, 45.0 + skills.size() * 8.0);
        String heuristicType = inferHeuristicProfileType(skills);
        return AIResult.builder()
                .userId(user.getId())
                .offerId(request.offerId())
                .applicationId(request.applicationId())
                .type(AIResultType.CV_ANALYSIS)
                .score(score)
                .extractedSkills(skills)
                .profileType(heuristicType)
                .primaryStack(skills.stream().limit(4).reduce((a, b) -> a + ", " + b).orElse(""))
                .seniority(skills.size() >= 8 ? "Mid" : skills.size() >= 4 ? "Junior" : "Student")
                .recommendation(context.resumeParsed()
                        ? "Profile and uploaded CV scanned. Connect the AI engine for deeper analysis."
                        : "Analysis used profile fields only. Upload a PDF or DOCX resume for richer signals.")
                .conclusion(heuristicType + " candidate; matched " + skills.size() + " skills from profile and resume.")
                .details(context.resumeParsed()
                        ? "Resume text extracted; skills matched from CV and profile."
                        : "Profile fields only — no resume text available.")
                .analysisSource("Smart Match heuristic")
                .build();
    }

    private String inferHeuristicProfileType(List<String> skills) {
        if (skills == null || skills.isEmpty()) return "Candidate";
        java.util.Set<String> set = new java.util.HashSet<>();
        for (String s : skills) set.add(s.toLowerCase(Locale.ROOT));
        if (set.contains("react") || set.contains("next.js") || set.contains("vue") || set.contains("angular"))
            return "Frontend Engineer";
        if (set.contains("react native") || set.contains("flutter") || set.contains("swift") || set.contains("kotlin"))
            return "Mobile Engineer";
        if (set.contains("spring boot") || set.contains("django") || set.contains("flask") || set.contains("node.js") || set.contains("nestjs"))
            return "Backend Engineer";
        if (set.contains("pandas") || set.contains("numpy") || set.contains("scikit-learn") || set.contains("tensorflow") || set.contains("pytorch"))
            return "Data / ML Engineer";
        if (set.contains("figma") || set.contains("adobe xd")) return "UI/UX Designer";
        if (set.contains("docker") || set.contains("kubernetes") || set.contains("terraform")) return "DevOps Engineer";
        return "Software Engineer";
    }

    private AIResult createOfferRecommendation(User user, AIJobRequest request) {
        CandidateProfile profile = getCandidateProfile(user.getId());
        CandidateContext context = buildCandidateContext(profile);
        List<Offer> publishedOffers = offerRepository.findByStatus(OfferStatus.PUBLISHED);

        if (aiMatchingClient.isEnabled() && !publishedOffers.isEmpty()) {
            // Shortlist heuristically, then score the top offers semantically with the LLM.
            List<Offer> shortlist = publishedOffers.stream()
                    .sorted(Comparator.comparingDouble(
                            (Offer offer) -> calculateMatchingScore(profile.getSkills(), offer.getRequiredSkills())).reversed())
                    .limit(AI_SCORE_LIMIT)
                    .toList();
            StringBuilder details = new StringBuilder();
            double bestScore = 0.0;
            for (Offer offer : shortlist) {
                AiMatchingClient.MatchResult match = aiMatchingClient.scoreMatch(context.text(), offerText(offer));
                bestScore = Math.max(bestScore, match.score());
                details.append(offer.getTitle()).append(" = ").append(match.score()).append("% ")
                        .append(match.reasons()).append("; ");
            }
            return AIResult.builder()
                    .userId(user.getId())
                    .type(AIResultType.OFFER_RECOMMENDATION)
                    .score(bestScore)
                    .extractedSkills(safeList(profile.getSkills()))
                    .recommendation("Offers ranked by AI semantic fit between your profile, CV, and each role.")
                    .details(details.toString().trim())
                    .analysisSource("Smart Match AI" + (context.resumeParsed() ? " · resume" : ""))
                    .build();
        }

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
                .analysisSource("Smart Match heuristic")
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
                .recommendation(aiMatchingClient.isEnabled()
                        ? "Candidates ranked by AI semantic fit with the offer requirements."
                        : "Candidates are ranked by skill overlap with the offer requirements.")
                .details("Recommended candidates: " + recommendations.size())
                .analysisSource(aiMatchingClient.isEnabled() ? "Smart Match AI" : "Smart Match heuristic")
                .build();
    }

    private AIResult createProfileOptimization(User user, AIJobRequest request) {
        CandidateProfile profile = candidateProfileRepository.findByUserId(user.getId()).orElse(null);
        if (aiMatchingClient.isEnabled() && profile != null) {
            CandidateContext context = buildCandidateContext(profile);
            AiMatchingClient.ProfileSuggestions suggestions = aiMatchingClient.optimizeProfile(context.text());
            return AIResult.builder()
                    .userId(user.getId())
                    .offerId(request.offerId())
                    .applicationId(request.applicationId())
                    .type(AIResultType.PROFILE_OPTIMIZATION)
                    .score(suggestions.score())
                    .extractedSkills(safeList(profile.getSkills()))
                    .recommendation(suggestions.recommendation())
                    .details(suggestions.details())
                    .analysisSource("Smart Match AI" + (context.resumeParsed() ? " · resume" : ""))
                    .build();
        }
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
                .details("Heuristic profile optimization based on missing candidate profile fields (AI disabled).")
                .analysisSource("Smart Match heuristic")
                .build();
    }

    private CandidateRecommendationResponse toCandidateRecommendation(Application application, Offer offer) {
        CandidateProfile profile = candidateProfileRepository.findByUserId(application.getCandidateId()).orElse(null);
        double score;
        if (aiMatchingClient.isEnabled() && profile != null) {
            score = aiMatchingClient.scoreMatch(buildCandidateContext(profile).text(), offerText(offer)).score();
        } else {
            score = calculateMatchingScore(profile == null ? List.of() : profile.getSkills(), offer.getRequiredSkills());
        }
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
                application.getReviewedAt(),
                application.getDecidedAt(),
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

    private record CandidateContext(String text, boolean resumeParsed, java.util.Optional<String> resumeText) {
    }

    private CandidateContext buildCandidateContext(CandidateProfile profile) {
        java.util.Optional<String> resumeText = resumeParserService.extractTextFromCvUrl(profile.getCvUrl());
        StringBuilder text = new StringBuilder(profileText(profile));
        if (resumeText.isPresent()) {
            text.append("\n\n--- RESUME FILE TEXT (parsed from upload) ---\n");
            text.append(resumeParserService.truncate(resumeText.get()));
        } else if (StringUtils.hasText(profile.getCvUrl())) {
            text.append("\n\nNote: CV URL is set but text could not be extracted (unsupported format or fetch error).");
        }
        return new CandidateContext(text.toString(), resumeText.isPresent(), resumeText);
    }

    private String profileText(CandidateProfile profile) {
        return "Headline: " + nullSafe(profile.getHeadline())
                + "\nBio: " + nullSafe(profile.getBio())
                + "\nEducation: " + nullSafe(profile.getEducationLevel())
                + "\nField of study: " + nullSafe(profile.getFieldOfStudy())
                + "\nLocation: " + nullSafe(profile.getLocation())
                + "\nSkills: " + String.join(", ", safeList(profile.getSkills()))
                + "\nLanguages: " + String.join(", ", safeList(profile.getLanguages()))
                + "\nPreferences: " + String.join(", ", safeList(profile.getPreferences()))
                + "\nCV URL: " + nullSafe(profile.getCvUrl());
    }

    private List<com.smartmatch.model.SkillLevel> toSkillLevels(List<AiMatchingClient.SkillScore> scores) {
        if (scores == null) return List.of();
        return scores.stream()
                .filter(s -> s.name() != null && !s.name().isBlank())
                .map(s -> com.smartmatch.model.SkillLevel.builder().name(s.name().trim()).level(s.level()).build())
                .toList();
    }

    private List<com.smartmatch.model.SkillLevel> mergeSkillLevels(
            List<com.smartmatch.model.SkillLevel> existing,
            List<com.smartmatch.model.SkillLevel> fresh) {
        java.util.LinkedHashMap<String, com.smartmatch.model.SkillLevel> merged = new java.util.LinkedHashMap<>();
        if (existing != null) {
            for (com.smartmatch.model.SkillLevel level : existing) {
                if (level.getName() != null) merged.put(level.getName().toLowerCase(Locale.ROOT), level);
            }
        }
        if (fresh != null) {
            for (com.smartmatch.model.SkillLevel level : fresh) {
                if (level.getName() != null) merged.put(level.getName().toLowerCase(Locale.ROOT), level);
            }
        }
        return List.copyOf(merged.values());
    }

    private List<String> mergeSkills(List<String> profileSkills, List<String> extra) {
        java.util.LinkedHashSet<String> merged = new java.util.LinkedHashSet<>();
        safeList(profileSkills).stream().filter(StringUtils::hasText).map(String::trim).forEach(merged::add);
        safeList(extra).stream().filter(StringUtils::hasText).map(String::trim).forEach(merged::add);
        return List.copyOf(merged);
    }

    private static final List<String> RESUME_SKILL_HINTS = List.of(
            "react", "react native", "angular", "vue", "javascript", "typescript", "node", "node.js",
            "java", "spring", "spring boot", "python", "django", "flask", "c#", ".net",
            "sql", "postgresql", "mysql", "mongodb", "docker", "kubernetes", "aws", "azure", "gcp",
            "figma", "git", "html", "css", "tailwind", "next.js", "express", "graphql", "rest api"
    );

    private List<String> extractSkillsFromResumeText(java.util.Optional<String> resumeText) {
        if (resumeText.isEmpty()) {
            return List.of();
        }
        String lower = resumeText.get().toLowerCase(Locale.ROOT);
        List<String> found = new ArrayList<>();
        for (String hint : RESUME_SKILL_HINTS) {
            if (lower.contains(hint)) {
                found.add(formatSkillHint(hint));
            }
        }
        return found;
    }

    private String formatSkillHint(String hint) {
        if (hint.length() <= 3) {
            return hint.toUpperCase(Locale.ROOT);
        }
        String[] parts = hint.split("[\\s./]+");
        StringBuilder formatted = new StringBuilder();
        for (String part : parts) {
            if (part.isEmpty()) {
                continue;
            }
            if (!formatted.isEmpty()) {
                formatted.append(' ');
            }
            formatted.append(Character.toUpperCase(part.charAt(0))).append(part.substring(1));
        }
        return formatted.toString();
    }

    private String offerText(Offer offer) {
        return "Title: " + nullSafe(offer.getTitle())
                + "\nType: " + (offer.getType() == null ? "" : offer.getType().name())
                + "\nLocation: " + nullSafe(offer.getLocation())
                + "\nDuration: " + nullSafe(offer.getDuration())
                + "\nRequired skills: " + String.join(", ", safeList(offer.getRequiredSkills()))
                + "\nDescription: " + nullSafe(offer.getDescription());
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

    private String nullSafe(String value) {
        return value == null ? "" : value;
    }

    private <T> List<T> safeList(List<T> values) {
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
                safeList(result.getSkillLevels()),
                result.getProfileType(),
                result.getPrimaryStack(),
                result.getSeniority(),
                result.getRecommendation(),
                result.getConclusion(),
                result.getDetails(),
                result.getCreatedAt()
        );
    }
}
