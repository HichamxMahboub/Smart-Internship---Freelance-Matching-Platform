package com.smartmatch.service;

import com.smartmatch.dto.candidate.CandidateProfileRequest;
import com.smartmatch.dto.candidate.CandidateProfileResponse;
import com.smartmatch.dto.candidate.CvUploadResponse;
import com.smartmatch.exception.NotFoundException;
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

    public CandidateProfileResponse getCurrentProfile() {
        User user = SecurityUtils.currentUser();
        return candidateProfileRepository.findByUserId(user.getId())
                .map(this::toResponse)
                .orElseThrow(() -> new NotFoundException("Candidate profile not found for current user"));
    }

    public CandidateProfileResponse updateCurrentProfile(CandidateProfileRequest request) {
        User user = SecurityUtils.currentUser();
        CandidateProfile profile = candidateProfileRepository.findByUserId(user.getId())
                .orElseGet(() -> CandidateProfile.builder().userId(user.getId()).build());

        profile.setEducationLevel(request.educationLevel());
        profile.setFieldOfStudy(request.fieldOfStudy());
        profile.setLocation(request.location());
        profile.setCvUrl(request.cvUrl());
        profile.setSkills(safeList(request.skills()));
        profile.setLanguages(safeList(request.languages()));
        profile.setPreferences(safeList(request.preferences()));

        return toResponse(candidateProfileRepository.save(profile));
    }

    public CvUploadResponse uploadCurrentUserCv(MultipartFile file) {
        User user = SecurityUtils.currentUser();
        CandidateProfile profile = candidateProfileRepository.findByUserId(user.getId())
                .orElseGet(() -> CandidateProfile.builder().userId(user.getId()).build());

        String cvUrl = fileStorageService.storeCv(file, user.getId());
        profile.setCvUrl(cvUrl);
        candidateProfileRepository.save(profile);

        return new CvUploadResponse(cvUrl);
    }

    private CandidateProfileResponse toResponse(CandidateProfile profile) {
        return new CandidateProfileResponse(
                profile.getId(),
                profile.getUserId(),
                profile.getEducationLevel(),
                profile.getFieldOfStudy(),
                profile.getLocation(),
                profile.getCvUrl(),
                safeList(profile.getSkills()),
                safeList(profile.getLanguages()),
                safeList(profile.getPreferences()),
                profile.getCreatedAt(),
                profile.getUpdatedAt()
        );
    }

    private List<String> safeList(List<String> values) {
        return values == null ? List.of() : values;
    }
}
