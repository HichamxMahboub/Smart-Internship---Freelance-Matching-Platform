package com.smartmatch.dto.subscription;

import jakarta.validation.constraints.NotBlank;

public record UpgradeSubscriptionRequest(
        @NotBlank String paymentMethod
) {
}
