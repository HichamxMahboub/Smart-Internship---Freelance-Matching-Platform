package com.smartmatch.controller;

import com.smartmatch.dto.recruiter.RecruiterProfileRequest;
import com.smartmatch.dto.recruiter.RecruiterProfileResponse;
import com.smartmatch.service.RecruiterProfileService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/recruiter-profiles")
@RequiredArgsConstructor
@PreAuthorize("hasRole('RECRUITER')")
public class RecruiterProfileController {
    private final RecruiterProfileService recruiterProfileService;

    @GetMapping("/me")
    public ResponseEntity<RecruiterProfileResponse> getCurrentProfile() {
        return ResponseEntity.ok(recruiterProfileService.getCurrentProfile());
    }

    @PutMapping("/me")
    public ResponseEntity<RecruiterProfileResponse> updateCurrentProfile(@Valid @RequestBody RecruiterProfileRequest request) {
        return ResponseEntity.ok(recruiterProfileService.updateCurrentProfile(request));
    }
}
