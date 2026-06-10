package com.smartmatch.dto.payment;

/** Returned to the client so it can open the Stripe Checkout page and later confirm the payment. */
public record CheckoutSessionResponse(
        String paymentId,
        String sessionId,
        String url
) {
}
