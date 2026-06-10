package com.smartmatch.dto.payment;

import com.smartmatch.model.enums.PaymentStatus;
import com.smartmatch.model.enums.PaymentType;

import java.math.BigDecimal;
import java.time.Instant;

public record PaymentResponse(
        String id,
        PaymentType type,
        String subscriptionId,
        String userId,
        String payerId,
        String payerName,
        String payeeId,
        String payeeName,
        String offerId,
        String offerTitle,
        String applicationId,
        BigDecimal amount,
        String currency,
        String method,
        String description,
        PaymentStatus status,
        Instant paidAt,
        Instant createdAt
) {
}
