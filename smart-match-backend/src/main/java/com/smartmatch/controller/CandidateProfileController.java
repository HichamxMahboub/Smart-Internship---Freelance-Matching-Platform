package com.smartmatch.controller;

import com.smartmatch.dto.candidate.CandidateProfileRequest;
import com.smartmatch.dto.candidate.CandidateProfileResponse;
import com.smartmatch.dto.candidate.CvUploadResponse;
import com.smartmatch.service.CandidateProfileService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/candidate-profiles")
@RequiredArgsConstructor
@PreAuthorize("hasRole('CANDIDATE')")
public class CandidateProfileController {
    private final CandidateProfileService candidateProfileService;

    @GetMapping("/me")
    public ResponseEntity<CandidateProfileResponse> getCurrentProfile() {
        return ResponseEntity.ok(candidateProfileService.getCurrentProfile());
    }

    @PutMapping("/me")
    public ResponseEntity<CandidateProfileResponse> updateCurrentProfile(@Valid @RequestBody CandidateProfileRequest request) {
        return ResponseEntity.ok(candidateProfileService.updateCurrentProfile(request));
    }

    @PostMapping(value = "/me/upload-cv", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<CvUploadResponse> uploadCv(@RequestParam("file") MultipartFile file) {
        return ResponseEntity.ok(candidateProfileService.uploadCurrentUserCv(file));
    }
}
