package com.smartmatch.controller;

import com.smartmatch.dto.assistant.AssistantChatRequest;
import com.smartmatch.dto.assistant.AssistantChatResponse;
import com.smartmatch.dto.assistant.MatchItem;
import com.smartmatch.service.AssistantService;
import com.smartmatch.util.SecurityUtils;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/**
 * Backoffice-facing entry point for the Assistant intelligent Interlance. Forwards questions to the n8n RAG
 * workflow via {@link AssistantService}. Admins and recruiters only.
 */
@RestController
@RequestMapping("/api/assistant")
@RequiredArgsConstructor
public class AssistantController {
    private final AssistantService assistantService;

    @PostMapping("/chat")
    @PreAuthorize("hasAnyRole('ADMIN','RECRUITER')")
    public ResponseEntity<AssistantChatResponse> chat(@Valid @RequestBody AssistantChatRequest request) {
        return ResponseEntity.ok(assistantService.chat(request));
    }

    /** AI-ranked offers that best match the signed-in candidate's profile. */
    @GetMapping("/candidate-matches")
    @PreAuthorize("hasRole('CANDIDATE')")
    public ResponseEntity<List<MatchItem>> candidateMatches() {
        return ResponseEntity.ok(assistantService.candidateMatches(SecurityUtils.currentUser().getId()));
    }

    /** AI-ranked candidates that best match one of the recruiter's offers. */
    @GetMapping("/recruiter-matches")
    @PreAuthorize("hasRole('RECRUITER')")
    public ResponseEntity<List<MatchItem>> recruiterMatches(@RequestParam String offerId) {
        return ResponseEntity.ok(assistantService.recruiterMatches(offerId));
    }
}
