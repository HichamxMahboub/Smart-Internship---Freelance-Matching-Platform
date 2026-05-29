package com.smartmatch.controller;

import com.smartmatch.dto.ai.AIJobRequest;
import com.smartmatch.dto.ai.AIResultResponse;
import com.smartmatch.dto.ai.CandidateRecommendationResponse;
import com.smartmatch.service.AIService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/ai")
@RequiredArgsConstructor
public class AIController {
    private final AIService aiService;

    @PostMapping("/jobs")
    public ResponseEntity<AIResultResponse> createJob(@Valid @RequestBody AIJobRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(aiService.createJob(request));
    }

    @GetMapping("/jobs/{id}/result")
    public ResponseEntity<AIResultResponse> getResult(@PathVariable String id) {
        return ResponseEntity.ok(aiService.getResult(id));
    }

    @GetMapping("/candidates/recommendations/{offerId}")
    @PreAuthorize("hasAnyRole('RECRUITER','ADMIN')")
    public ResponseEntity<List<CandidateRecommendationResponse>> getCandidateRecommendations(@PathVariable String offerId) {
        return ResponseEntity.ok(aiService.getCandidateRecommendationsForOffer(offerId));
    }
}
