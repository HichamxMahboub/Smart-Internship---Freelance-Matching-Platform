package com.smartmatch.service;

import com.smartmatch.dto.favorite.FavoriteResponse;
import com.smartmatch.exception.BadRequestException;
import com.smartmatch.exception.ConflictException;
import com.smartmatch.exception.NotFoundException;
import com.smartmatch.model.Favorite;
import com.smartmatch.model.Offer;
import com.smartmatch.model.User;
import com.smartmatch.model.enums.OfferStatus;
import com.smartmatch.repository.FavoriteRepository;
import com.smartmatch.repository.OfferRepository;
import com.smartmatch.util.SecurityUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class FavoriteService {
    private final FavoriteRepository favoriteRepository;
    private final OfferRepository offerRepository;
    private final OfferService offerService;

    public FavoriteResponse addFavorite(String offerId) {
        User candidate = SecurityUtils.currentUser();
        Offer offer = getPublishedOffer(offerId);
        if (favoriteRepository.existsByUserIdAndOfferId(candidate.getId(), offer.getId())) {
            throw new ConflictException("Offer is already in favorites");
        }

        Favorite favorite = Favorite.builder()
                .userId(candidate.getId())
                .offerId(offer.getId())
                .build();
        return toResponse(favoriteRepository.save(favorite), offer);
    }

    public void removeFavorite(String offerId) {
        User candidate = SecurityUtils.currentUser();
        Favorite favorite = favoriteRepository.findByUserIdAndOfferId(candidate.getId(), offerId)
                .orElseThrow(() -> new NotFoundException("Favorite not found for offer id: " + offerId));
        favoriteRepository.delete(favorite);
    }

    public List<FavoriteResponse> getCurrentCandidateFavorites() {
        User candidate = SecurityUtils.currentUser();
        return favoriteRepository.findByUserId(candidate.getId()).stream()
                .map(favorite -> {
                    Offer offer = offerRepository.findById(favorite.getOfferId()).orElse(null);
                    return toResponse(favorite, offer);
                })
                .toList();
    }

    private Offer getPublishedOffer(String offerId) {
        Offer offer = offerRepository.findById(offerId)
                .orElseThrow(() -> new NotFoundException("Offer not found with id: " + offerId));
        if (offer.getStatus() != OfferStatus.PUBLISHED) {
            throw new BadRequestException("Candidates can favorite only published offers");
        }
        return offer;
    }

    private FavoriteResponse toResponse(Favorite favorite, Offer offer) {
        return new FavoriteResponse(
                favorite.getId(),
                favorite.getUserId(),
                favorite.getOfferId(),
                offer == null ? null : offerService.toResponse(offer),
                favorite.getCreatedAt()
        );
    }
}
