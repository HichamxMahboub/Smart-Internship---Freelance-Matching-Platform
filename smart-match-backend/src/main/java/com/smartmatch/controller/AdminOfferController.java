package com.smartmatch.controller;

import com.smartmatch.dto.offer.ModerateOfferRequest;
import com.smartmatch.dto.offer.OfferResponse;
import com.smartmatch.service.AdminOfferService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin/offers")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminOfferController {
    private final AdminOfferService adminOfferService;

    @PatchMapping("/{id}/moderate")
    public ResponseEntity<OfferResponse> moderateOffer(@PathVariable String id,
                                                       @Valid @RequestBody ModerateOfferRequest request) {
        return ResponseEntity.ok(adminOfferService.moderateOffer(id, request.status()));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteOffer(@PathVariable String id) {
        adminOfferService.deleteOffer(id);
        return ResponseEntity.noContent().build();
    }
}
