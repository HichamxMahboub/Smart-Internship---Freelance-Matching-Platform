package com.smartmatch.dto.admin;

import com.smartmatch.model.enums.Plan;
import com.smartmatch.model.enums.Role;
import com.smartmatch.model.enums.SubscriptionStatus;

import java.math.BigDecimal;
import java.time.Instant;

public record AdminSubscriptionItemResponse(
        String id,
        String userId,
        String userFullName,
        String userEmail,
        Role userRole,
        Plan plan,
        boolean active,
        Instant startDate,
        Instant expirationDate,
        SubscriptionStatus status,
        BigDecimal lastPaymentAmount,
        String lastPaymentCurrency,
        Instant lastPaymentAt,
        Instant createdAt,
        Instant updatedAt
) {
}
