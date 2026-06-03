package com.smartmatch.service;

import com.smartmatch.dto.recruiter.RecruiterProfileRequest;
import com.smartmatch.dto.recruiter.RecruiterProfileResponse;
import com.smartmatch.exception.ForbiddenException;
import com.smartmatch.exception.NotFoundException;
import com.smartmatch.model.Company;
import com.smartmatch.model.RecruiterProfile;
import com.smartmatch.model.User;
import com.smartmatch.repository.CompanyRepository;
import com.smartmatch.repository.RecruiterProfileRepository;
import com.smartmatch.util.SecurityUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

@Service
@RequiredArgsConstructor
public class RecruiterProfileService {
    private final RecruiterProfileRepository recruiterProfileRepository;
    private final CompanyRepository companyRepository;

    public RecruiterProfileResponse getCurrentProfile() {
        User user = SecurityUtils.currentUser();
        return recruiterProfileRepository.findByUserId(user.getId())
                .map(this::toResponse)
                .orElseThrow(() -> new NotFoundException("Recruiter profile not found for current user"));
    }

    public RecruiterProfileResponse updateCurrentProfile(RecruiterProfileRequest request) {
        User user = SecurityUtils.currentUser();
        RecruiterProfile profile = recruiterProfileRepository.findByUserId(user.getId())
                .orElseGet(() -> RecruiterProfile.builder().userId(user.getId()).build());

        if (StringUtils.hasText(request.companyId())) {
            Company company = companyRepository.findById(request.companyId())
                    .orElseThrow(() -> new NotFoundException("Company not found with id: " + request.companyId()));
            if (!company.getRecruiterId().equals(user.getId())) {
                throw new ForbiddenException("You can only attach your own company to your recruiter profile");
            }
            profile.setCompanyId(request.companyId());
        }

        profile.setPhotoUrl(request.photoUrl());
        profile.setHeadline(request.headline());
        profile.setBio(request.bio());
        profile.setLinkedin(request.linkedin());
        profile.setPosition(request.position());
        profile.setPhone(request.phone());

        return toResponse(recruiterProfileRepository.save(profile));
    }

    private RecruiterProfileResponse toResponse(RecruiterProfile profile) {
        return new RecruiterProfileResponse(
                profile.getId(),
                profile.getUserId(),
                profile.getCompanyId(),
                profile.getPhotoUrl(),
                profile.getHeadline(),
                profile.getBio(),
                profile.getLinkedin(),
                profile.getPosition(),
                profile.getPhone(),
                profile.getCreatedAt(),
                profile.getUpdatedAt()
        );
    }
}
