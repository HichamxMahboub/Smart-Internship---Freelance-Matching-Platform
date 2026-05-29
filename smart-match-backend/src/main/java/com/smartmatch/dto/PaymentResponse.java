package com.smartmatch.dto;

import com.smartmatch.model.enums.PaymentStatus;

import java.math.BigDecimal;
import java.time.Instant;

public record PaymentResponse(
        String id,
        String subscriptionId,
        String userId,
        BigDecimal amount,
        String currency,
        String method,
        PaymentStatus status,
        Instant paidAt,
        Instant createdAt
) {
}
