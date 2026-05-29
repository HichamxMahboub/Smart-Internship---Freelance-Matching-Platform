package com.smartmatch.dto.favorite;

import com.smartmatch.dto.offer.OfferResponse;

import java.time.Instant;

public record FavoriteResponse(
        String id,
        String userId,
        String offerId,
        OfferResponse offer,
        Instant createdAt
) {
}
