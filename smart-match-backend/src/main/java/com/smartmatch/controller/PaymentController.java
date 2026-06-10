package com.smartmatch.controller;

import com.smartmatch.dto.payment.CheckoutSessionResponse;
import com.smartmatch.dto.payment.FreelancePaymentRequest;
import com.smartmatch.dto.payment.PaymentResponse;
import com.smartmatch.service.PaymentService;
import com.smartmatch.service.StripeService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/payments")
@RequiredArgsConstructor
public class PaymentController {
    private final PaymentService paymentService;
    private final StripeService stripeService;

    @GetMapping("/me")
    public ResponseEntity<List<PaymentResponse>> getMyPayments() {
        return ResponseEntity.ok(paymentService.getCurrentUserPayments());
    }

    @GetMapping("/earnings")
    @PreAuthorize("hasRole('CANDIDATE')")
    public ResponseEntity<List<PaymentResponse>> getMyEarnings() {
        return ResponseEntity.ok(paymentService.getEarnings());
    }

    @PostMapping("/freelance/checkout")
    @PreAuthorize("hasRole('RECRUITER')")
    public ResponseEntity<CheckoutSessionResponse> createFreelanceCheckout(@Valid @RequestBody FreelancePaymentRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(stripeService.createFreelanceCheckout(request));
    }

    @PostMapping("/subscription/checkout")
    public ResponseEntity<CheckoutSessionResponse> createSubscriptionCheckout() {
        return ResponseEntity.status(HttpStatus.CREATED).body(stripeService.createSubscriptionCheckout());
    }

    @PostMapping("/{id}/confirm")
    public ResponseEntity<PaymentResponse> confirmPayment(@PathVariable String id) {
        return ResponseEntity.ok(stripeService.confirmFromStripe(id));
    }

    @PostMapping("/stripe/webhook")
    public ResponseEntity<String> stripeWebhook(@RequestBody String payload,
                                                @RequestHeader(value = "Stripe-Signature", required = false) String signature) {
        stripeService.handleWebhook(payload, signature);
        return ResponseEntity.ok("ok");
    }

    @GetMapping("/{id}")
    public ResponseEntity<PaymentResponse> getPaymentById(@PathVariable String id) {
        return ResponseEntity.ok(paymentService.getPaymentById(id));
    }
}
