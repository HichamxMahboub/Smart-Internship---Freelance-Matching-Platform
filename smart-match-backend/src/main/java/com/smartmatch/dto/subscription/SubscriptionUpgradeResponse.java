package com.smartmatch.dto.subscription;

import com.smartmatch.dto.payment.PaymentResponse;

public record SubscriptionUpgradeResponse(
        SubscriptionResponse subscription,
        PaymentResponse payment
) {
}
