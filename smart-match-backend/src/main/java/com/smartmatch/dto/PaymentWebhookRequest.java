package com.smartmatch.dto;

import com.smartmatch.model.enums.PaymentStatus;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record PaymentWebhookRequest(
        @NotBlank String paymentId,
        @NotNull PaymentStatus status
) {
}
