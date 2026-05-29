package com.smartmatch.dto;

import java.time.Instant;

public record FavoriteResponse(
        String id,
        String userId,
        String offerId,
        Instant createdAt
) {
}
