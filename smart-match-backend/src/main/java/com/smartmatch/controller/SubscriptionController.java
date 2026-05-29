package com.smartmatch.controller;

import com.smartmatch.dto.payment.PaymentResponse;
import com.smartmatch.dto.subscription.PaymentWebhookRequest;
import com.smartmatch.dto.subscription.SubscriptionResponse;
import com.smartmatch.dto.subscription.SubscriptionUpgradeResponse;
import com.smartmatch.dto.subscription.UpgradeSubscriptionRequest;
import com.smartmatch.service.SubscriptionService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/subscriptions")
@RequiredArgsConstructor
public class SubscriptionController {
    private final SubscriptionService subscriptionService;

    @GetMapping("/me")
    public ResponseEntity<SubscriptionResponse> getCurrentSubscription() {
        return ResponseEntity.ok(subscriptionService.getCurrentSubscription());
    }

    @PostMapping("/upgrade")
    public ResponseEntity<SubscriptionUpgradeResponse> upgrade(@Valid @RequestBody UpgradeSubscriptionRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(subscriptionService.upgradeToPremium(request));
    }

    @PostMapping("/webhook/payment")
    public ResponseEntity<PaymentResponse> paymentWebhook(@RequestHeader("X-Payment-Secret") String secret,
                                                          @Valid @RequestBody PaymentWebhookRequest request) {
        return ResponseEntity.ok(subscriptionService.processPaymentWebhook(secret, request));
    }
}
