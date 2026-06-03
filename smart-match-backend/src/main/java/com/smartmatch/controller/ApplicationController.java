package com.smartmatch.controller;

import com.smartmatch.dto.application.ApplicationOverviewResponse;
import com.smartmatch.dto.application.ApplicationRequest;
import com.smartmatch.dto.application.ApplicationResponse;
import com.smartmatch.dto.application.ApplicationStatusUpdateRequest;
import com.smartmatch.service.ApplicationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/applications")
@RequiredArgsConstructor
public class ApplicationController {
    private final ApplicationService applicationService;

    @PostMapping
    @PreAuthorize("hasRole('CANDIDATE')")
    public ResponseEntity<ApplicationResponse> apply(@Valid @RequestBody ApplicationRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(applicationService.apply(request));
    }

    @GetMapping("/me")
    @PreAuthorize("hasRole('CANDIDATE')")
    public ResponseEntity<List<ApplicationResponse>> getMyApplications() {
        return ResponseEntity.ok(applicationService.getCurrentCandidateApplications());
    }

    @GetMapping("/recruiter")
    @PreAuthorize("hasRole('RECRUITER')")
    public ResponseEntity<List<ApplicationResponse>> getRecruiterApplications() {
        return ResponseEntity.ok(applicationService.getCurrentRecruiterApplications());
    }

    @GetMapping("/admin")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<ApplicationResponse>> getAllApplications() {
        return ResponseEntity.ok(applicationService.getAllApplications());
    }

    @GetMapping("/admin/overview")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<ApplicationOverviewResponse>> getAllApplicationsOverview() {
        return ResponseEntity.ok(applicationService.getAllApplicationsOverview());
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApplicationResponse> getApplicationById(@PathVariable String id) {
        return ResponseEntity.ok(applicationService.getApplicationById(id));
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize("hasRole('RECRUITER')")
    public ResponseEntity<ApplicationResponse> updateApplicationStatus(@PathVariable String id,
                                                                       @Valid @RequestBody ApplicationStatusUpdateRequest request) {
        return ResponseEntity.ok(applicationService.updateApplicationStatus(id, request));
    }
}
