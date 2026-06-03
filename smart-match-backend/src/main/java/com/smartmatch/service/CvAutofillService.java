package com.smartmatch.service;

import com.smartmatch.dto.candidate.CandidateProfileResponse;
import com.smartmatch.dto.candidate.CvAutofillResponse;
import com.smartmatch.exception.BadRequestException;
import com.smartmatch.model.CandidateProfile;
import com.smartmatch.model.Education;
import com.smartmatch.model.Experience;
import com.smartmatch.model.SkillLevel;
import com.smartmatch.model.User;
import com.smartmatch.repository.CandidateProfileRepository;
import com.smartmatch.util.SecurityUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.util.ArrayList;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Locale;
import java.util.Optional;

/**
 * Uploads a CV, parses its text, and uses the AI client to extract a structured
 * candidate profile that auto-fills the platform fields (headline, bio, skills with
 * proficiency levels, experiences, educations, languages, location, study).
 */
@Service
@RequiredArgsConstructor
public class CvAutofillService {
    private final CandidateProfileRepository candidateProfileRepository;
    private final FileStorageService fileStorageService;
    private final ResumeParserService resumeParserService;
    private final AiMatchingClient aiMatchingClient;

    public CvAutofillResponse autofillFromCv(MultipartFile file, boolean overwrite) {
        User user = SecurityUtils.currentUser();
        CandidateProfile profile = candidateProfileRepository.findByUserId(user.getId())
                .orElseGet(() -> CandidateProfile.builder().userId(user.getId()).build());

        String cvUrl = fileStorageService.storeCv(file, user.getId());
        profile.setCvUrl(cvUrl);

        Optional<String> resumeText = resumeParserService.extractTextFromCvUrl(cvUrl);
        if (resumeText.isEmpty()) {
            candidateProfileRepository.save(profile);
            throw new BadRequestException("Could not read text from this CV. Use a text-based PDF or DOCX.");
        }

        boolean aiUsed = aiMatchingClient.isEnabled();
        String source;
        int skillCount;
        int expCount;
        int eduCount;

        if (aiUsed) {
            AiMatchingClient.StructuredProfile structured = aiMatchingClient.extractStructuredProfile(resumeText.get());
            applyIfBlankOrOverwrite(structured.headline(), profile::getHeadline, profile::setHeadline, overwrite);
            applyIfBlankOrOverwrite(structured.bio(), profile::getBio, profile::setBio, overwrite);
            applyIfBlankOrOverwrite(structured.location(), profile::getLocation, profile::setLocation, overwrite);
            applyIfBlankOrOverwrite(structured.fieldOfStudy(), profile::getFieldOfStudy, profile::setFieldOfStudy, overwrite);
            applyIfBlankOrOverwrite(structured.educationLevel(), profile::getEducationLevel, profile::setEducationLevel, overwrite);

            List<SkillLevel> aiLevels = structured.skillLevels().stream()
                    .filter(s -> s.name() != null && !s.name().isBlank())
                    .map(s -> SkillLevel.builder().name(s.name().trim()).level(s.level()).build())
                    .toList();
            profile.setSkillLevels(mergeSkillLevels(profile.getSkillLevels(), aiLevels));
            profile.setSkills(mergedSkillNames(profile.getSkills(), aiLevels));
            skillCount = aiLevels.size();

            List<String> aiLanguages = structured.languages() == null ? List.of() : structured.languages();
            profile.setLanguages(mergeStrings(profile.getLanguages(), aiLanguages));

            List<Experience> aiExperiences = structured.experiences().stream()
                    .filter(e -> StringUtils.hasText(e.role()) || StringUtils.hasText(e.org()))
                    .map(e -> Experience.builder()
                            .role(e.role())
                            .org(e.org())
                            .start(e.start())
                            .end(e.end())
                            .current(e.current())
                            .description(e.description())
                            .build())
                    .toList();
            profile.setExperiences(overwrite || isEmpty(profile.getExperiences()) ? aiExperiences : profile.getExperiences());
            expCount = aiExperiences.size();

            List<Education> aiEducations = structured.educations().stream()
                    .filter(e -> StringUtils.hasText(e.school()))
                    .map(e -> Education.builder()
                            .school(e.school())
                            .degree(e.degree())
                            .field(e.field())
                            .start(e.start())
                            .end(e.end())
                            .build())
                    .toList();
            profile.setEducations(overwrite || isEmpty(profile.getEducations()) ? aiEducations : profile.getEducations());
            eduCount = aiEducations.size();

            source = "Smart Match AI";
        } else {
            // Offline fallback: skill keyword extraction only, no structured fields.
            List<String> heuristicSkills = HeuristicSkillExtractor.extract(resumeText.get());
            profile.setSkills(mergeStrings(profile.getSkills(), heuristicSkills));
            skillCount = heuristicSkills.size();
            expCount = 0;
            eduCount = 0;
            source = "Smart Match heuristic";
        }

        CandidateProfile saved = candidateProfileRepository.save(profile);
        return new CvAutofillResponse(toResponse(saved), aiUsed, source, skillCount, expCount, eduCount);
    }

    private void applyIfBlankOrOverwrite(String value, java.util.function.Supplier<String> getter,
                                         java.util.function.Consumer<String> setter, boolean overwrite) {
        if (!StringUtils.hasText(value)) return;
        if (overwrite || !StringUtils.hasText(getter.get())) {
            setter.accept(value);
        }
    }

    private List<SkillLevel> mergeSkillLevels(List<SkillLevel> existing, List<SkillLevel> fresh) {
        java.util.LinkedHashMap<String, SkillLevel> merged = new java.util.LinkedHashMap<>();
        if (existing != null) {
            for (SkillLevel l : existing) if (l.getName() != null) merged.put(l.getName().toLowerCase(Locale.ROOT), l);
        }
        if (fresh != null) {
            for (SkillLevel l : fresh) if (l.getName() != null) merged.put(l.getName().toLowerCase(Locale.ROOT), l);
        }
        return List.copyOf(merged.values());
    }

    private List<String> mergedSkillNames(List<String> existing, List<SkillLevel> levels) {
        LinkedHashSet<String> set = new LinkedHashSet<>();
        if (existing != null) existing.forEach(s -> { if (StringUtils.hasText(s)) set.add(s.trim()); });
        if (levels != null) levels.forEach(l -> { if (l.getName() != null) set.add(l.getName().trim()); });
        return new ArrayList<>(set);
    }

    private List<String> mergeStrings(List<String> existing, List<String> fresh) {
        LinkedHashSet<String> set = new LinkedHashSet<>();
        if (existing != null) existing.forEach(s -> { if (StringUtils.hasText(s)) set.add(s.trim()); });
        if (fresh != null) fresh.forEach(s -> { if (StringUtils.hasText(s)) set.add(s.trim()); });
        return new ArrayList<>(set);
    }

    private boolean isEmpty(List<?> list) {
        return list == null || list.isEmpty();
    }

    private CandidateProfileResponse toResponse(CandidateProfile p) {
        return new CandidateProfileResponse(
                p.getId(), p.getUserId(), p.getPhotoUrl(), p.getHeadline(), p.getBio(),
                p.getEducationLevel(), p.getFieldOfStudy(), p.getLocation(), p.getCvUrl(),
                p.getSkills() == null ? List.of() : p.getSkills(),
                p.getSkillLevels() == null ? List.of() : p.getSkillLevels(),
                p.getLanguages() == null ? List.of() : p.getLanguages(),
                p.getPreferences() == null ? List.of() : p.getPreferences(),
                p.getProjects() == null ? List.of() : p.getProjects(),
                p.getExperiences() == null ? List.of() : p.getExperiences(),
                p.getEducations() == null ? List.of() : p.getEducations(),
                p.getSocials(), p.getCreatedAt(), p.getUpdatedAt());
    }
}
