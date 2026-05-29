package com.smartmatch.dto.subscription;

import com.smartmatch.model.enums.Plan;
import com.smartmatch.model.enums.SubscriptionStatus;

import java.time.Instant;

public record SubscriptionResponse(
        String id,
        String userId,
        Plan plan,
        boolean active,
        Instant startDate,
        Instant expirationDate,
        SubscriptionStatus status,
        Instant createdAt,
        Instant updatedAt
) {
}
