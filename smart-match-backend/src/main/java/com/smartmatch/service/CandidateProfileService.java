package com.smartmatch.service;

import com.smartmatch.dto.candidate.CandidateProfileRequest;
import com.smartmatch.dto.candidate.CandidateProfileResponse;
import com.smartmatch.dto.candidate.CvUploadResponse;
import com.smartmatch.model.CandidateProfile;
import com.smartmatch.model.User;
import com.smartmatch.repository.CandidateProfileRepository;
import com.smartmatch.util.SecurityUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@Service
@RequiredArgsConstructor
public class CandidateProfileService {
    private final CandidateProfileRepository candidateProfileRepository;
    private final FileStorageService fileStorageService;
    private final AIService aiService;

    public CandidateProfileResponse getCurrentProfile() {
        User user = SecurityUtils.currentUser();
        return candidateProfileRepository.findByUserId(user.getId())
                .map(this::toResponse)
                .orElseGet(() -> emptyResponse(user.getId()));
    }

    public CandidateProfileResponse updateCurrentProfile(CandidateProfileRequest request) {
        User user = SecurityUtils.currentUser();
        CandidateProfile profile = candidateProfileRepository.findByUserId(user.getId())
                .orElseGet(() -> CandidateProfile.builder().userId(user.getId()).build());

        profile.setPhotoUrl(request.photoUrl());
        profile.setHeadline(request.headline());
        profile.setBio(request.bio());
        profile.setEducationLevel(request.educationLevel());
        profile.setFieldOfStudy(request.fieldOfStudy());
        profile.setLocation(request.location());
        profile.setCvUrl(request.cvUrl());
        profile.setSkills(safeList(request.skills()));
        profile.setSkillLevels(safeList(request.skillLevels()));
        profile.setLanguages(safeList(request.languages()));
        profile.setPreferences(safeList(request.preferences()));
        profile.setProjects(safeList(request.projects()));
        profile.setExperiences(safeList(request.experiences()));
        profile.setEducations(safeList(request.educations()));
        profile.setSocials(request.socials());

        return toResponse(candidateProfileRepository.save(profile));
    }

    public CvUploadResponse uploadCurrentUserCv(MultipartFile file) {
        User user = SecurityUtils.currentUser();
        CandidateProfile profile = candidateProfileRepository.findByUserId(user.getId())
                .orElseGet(() -> CandidateProfile.builder().userId(user.getId()).build());

        String cvUrl = fileStorageService.storeCv(file, user.getId());
        profile.setCvUrl(cvUrl);
        candidateProfileRepository.save(profile);

        aiService.runCvAnalysisFor(user);

        return new CvUploadResponse(cvUrl);
    }

    private CandidateProfileResponse toResponse(CandidateProfile profile) {
        return new CandidateProfileResponse(
                profile.getId(),
                profile.getUserId(),
                profile.getPhotoUrl(),
                profile.getHeadline(),
                profile.getBio(),
                profile.getEducationLevel(),
                profile.getFieldOfStudy(),
                profile.getLocation(),
                profile.getCvUrl(),
                safeList(profile.getSkills()),
                safeList(profile.getSkillLevels()),
                safeList(profile.getLanguages()),
                safeList(profile.getPreferences()),
                safeList(profile.getProjects()),
                safeList(profile.getExperiences()),
                safeList(profile.getEducations()),
                profile.getSocials(),
                profile.getCreatedAt(),
                profile.getUpdatedAt()
        );
    }

    private CandidateProfileResponse emptyResponse(String userId) {
        return new CandidateProfileResponse(
                null,
                userId,
                null,
                null,
                null,
                null,
                null,
                null,
                null,
                List.of(),
                List.of(),
                List.of(),
                List.of(),
                List.of(),
                List.of(),
                List.of(),
                null,
                null,
                null
        );
    }

    private <T> List<T> safeList(List<T> values) {
        return values == null ? List.of() : values;
    }
}
