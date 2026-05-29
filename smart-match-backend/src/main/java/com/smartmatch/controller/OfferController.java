package com.smartmatch.controller;

import com.smartmatch.dto.offer.OfferFilterRequest;
import com.smartmatch.dto.offer.OfferRequest;
import com.smartmatch.dto.offer.OfferResponse;
import com.smartmatch.model.enums.OfferStatus;
import com.smartmatch.model.enums.OfferType;
import com.smartmatch.service.OfferService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/offers")
@RequiredArgsConstructor
@Validated
public class OfferController {
    private final OfferService offerService;

    @GetMapping
    public ResponseEntity<Page<OfferResponse>> getOffers(@RequestParam(required = false) String keyword,
                                                         @RequestParam(required = false) OfferType type,
                                                         @RequestParam(required = false) String location,
                                                         @RequestParam(required = false) String skill,
                                                         @RequestParam(required = false) OfferStatus status,
                                                         @RequestParam(defaultValue = "0") @Min(0) int page,
                                                         @RequestParam(defaultValue = "10") @Min(1) @Max(100) int size) {
        OfferFilterRequest filter = new OfferFilterRequest(keyword, type, location, skill, status, page, size);
        return ResponseEntity.ok(offerService.getOffers(filter));
    }

    @GetMapping("/{id}")
    public ResponseEntity<OfferResponse> getOfferById(@PathVariable String id) {
        return ResponseEntity.ok(offerService.getOfferById(id));
    }

    @PostMapping
    @PreAuthorize("hasRole('RECRUITER')")
    public ResponseEntity<OfferResponse> createOffer(@Valid @RequestBody OfferRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(offerService.createOffer(request));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('RECRUITER')")
    public ResponseEntity<OfferResponse> updateOffer(@PathVariable String id,
                                                     @Valid @RequestBody OfferRequest request) {
        return ResponseEntity.ok(offerService.updateOffer(id, request));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('RECRUITER')")
    public ResponseEntity<Void> deleteOffer(@PathVariable String id) {
        offerService.archiveOfferByDelete(id);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/{id}/publish")
    @PreAuthorize("hasRole('RECRUITER')")
    public ResponseEntity<OfferResponse> publishOffer(@PathVariable String id) {
        return ResponseEntity.ok(offerService.publishOffer(id));
    }

    @PatchMapping("/{id}/archive")
    @PreAuthorize("hasRole('RECRUITER')")
    public ResponseEntity<OfferResponse> archiveOffer(@PathVariable String id) {
        return ResponseEntity.ok(offerService.archiveOffer(id));
    }
}
