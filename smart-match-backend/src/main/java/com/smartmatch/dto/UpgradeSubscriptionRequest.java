package com.smartmatch.dto;

import jakarta.validation.constraints.NotBlank;

public record UpgradeSubscriptionRequest(
        @NotBlank String paymentMethod
) {
}
