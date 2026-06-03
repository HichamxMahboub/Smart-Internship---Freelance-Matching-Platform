package com.smartmatch.service;

import com.smartmatch.dto.offer.OfferResponse;
import com.smartmatch.exception.BadRequestException;
import com.smartmatch.exception.NotFoundException;
import com.smartmatch.model.Offer;
import com.smartmatch.model.enums.OfferStatus;
import com.smartmatch.repository.OfferRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.Instant;

@Service
@RequiredArgsConstructor
public class AdminOfferService {
    private final OfferRepository offerRepository;
    private final OfferService offerService;

    public OfferResponse moderateOffer(String id, OfferStatus status) {
        Offer offer = offerRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Offer not found with id: " + id));

        // Validate status is a valid moderation status
        if (status != OfferStatus.BLOCKED && status != OfferStatus.PUBLISHED && status != OfferStatus.ARCHIVED) {
            throw new BadRequestException("Invalid moderation status. Use BLOCKED, PUBLISHED, or ARCHIVED");
        }

        offer.setStatus(status);
        
        if (status == OfferStatus.BLOCKED) {
            offer.setArchiveAt(Instant.now());
        } else if (status == OfferStatus.PUBLISHED && offer.getPublishedAt() == null) {
            offer.setPublishedAt(Instant.now());
        } else if (status == OfferStatus.ARCHIVED) {
            offer.setArchiveAt(Instant.now());
        }

        return offerService.toResponse(offerRepository.save(offer));
    }

    public void deleteOffer(String id) {
        if (!offerRepository.existsById(id)) {
            throw new NotFoundException("Offer not found with id: " + id);
        }
        offerRepository.deleteById(id);
    }
}
