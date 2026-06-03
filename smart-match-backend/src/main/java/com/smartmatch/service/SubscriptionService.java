package com.smartmatch.service;

import com.smartmatch.dto.payment.PaymentResponse;
import com.smartmatch.dto.subscription.PaymentWebhookRequest;
import com.smartmatch.dto.subscription.SubscriptionResponse;
import com.smartmatch.dto.subscription.SubscriptionUpgradeResponse;
import com.smartmatch.dto.subscription.UpgradeSubscriptionRequest;
import com.smartmatch.exception.ConflictException;
import com.smartmatch.exception.ForbiddenException;
import com.smartmatch.exception.NotFoundException;
import com.smartmatch.model.Payment;
import com.smartmatch.model.Subscription;
import com.smartmatch.model.User;
import com.smartmatch.model.enums.NotificationType;
import com.smartmatch.model.enums.PaymentStatus;
import com.smartmatch.model.enums.Plan;
import com.smartmatch.model.enums.SubscriptionStatus;
import com.smartmatch.repository.PaymentRepository;
import com.smartmatch.repository.SubscriptionRepository;
import com.smartmatch.repository.UserRepository;
import com.smartmatch.util.SecurityUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.List;

@Service
@RequiredArgsConstructor
public class SubscriptionService {
    private final SubscriptionRepository subscriptionRepository;
    private final PaymentRepository paymentRepository;
    private final UserRepository userRepository;
    private final NotificationService notificationService;
    private final PaymentService paymentService;

    @Value("${app.payment.webhook-secret:dev-payment-secret}")
    private String webhookSecret;

    public SubscriptionResponse getCurrentSubscription() {
        User user = SecurityUtils.currentUser();
        return subscriptionRepository.findFirstByUserIdAndActiveTrueOrderByCreatedAtDesc(user.getId())
                .map(this::toResponse)
                .orElseGet(() -> new SubscriptionResponse(null, user.getId(), user.getPlan(), false, null, null, null, user.getCreatedAt(), user.getUpdatedAt()));
    }

    public SubscriptionUpgradeResponse upgradeToPremium(UpgradeSubscriptionRequest request) {
        User user = SecurityUtils.currentUser();
        if (subscriptionRepository.existsByUserIdAndPlanAndActiveTrue(user.getId(), Plan.PREMIUM)) {
            throw new ConflictException("User already has an active PREMIUM subscription");
        }

        Instant now = Instant.now();
        Subscription subscription = subscriptionRepository.save(Subscription.builder()
                .userId(user.getId())
                .plan(Plan.PREMIUM)
                .active(true)
                .startDate(now)
                .expirationDate(now.plus(30, ChronoUnit.DAYS))
                .status(SubscriptionStatus.ACTIVE)
                .build());

        Payment payment = paymentRepository.save(Payment.builder()
                .subscriptionId(subscription.getId())
                .userId(user.getId())
                .amount(BigDecimal.valueOf(99))
                .currency("MAD")
                .method(request.paymentMethod())
                .status(PaymentStatus.PAID)
                .paidAt(now)
                .build());

        user.setPlan(Plan.PREMIUM);
        userRepository.save(user);

        notificationService.create(
                user.getId(),
                "Premium subscription active",
                "Your PREMIUM subscription is active for 30 days.",
                NotificationType.SUBSCRIPTION);

        return new SubscriptionUpgradeResponse(toResponse(subscription), paymentService.toResponse(payment));
    }

    public PaymentResponse processPaymentWebhook(String secret, PaymentWebhookRequest request) {
        if (!webhookSecret.equals(secret)) {
            throw new ForbiddenException("Invalid payment webhook secret");
        }
        Payment payment = paymentRepository.findById(request.paymentId())
                .orElseThrow(() -> new NotFoundException("Payment not found with id: " + request.paymentId()));
        payment.setStatus(request.status());
        if (request.status() == PaymentStatus.PAID && payment.getPaidAt() == null) {
            payment.setPaidAt(Instant.now());
        }
        return paymentService.toResponse(paymentRepository.save(payment));
    }

    public List<SubscriptionResponse> getAllSubscriptions() {
        return subscriptionRepository.findAll().stream()
                .map(this::toResponse)
                .toList();
    }

    public SubscriptionResponse toResponse(Subscription subscription) {
        return new SubscriptionResponse(
                subscription.getId(),
                subscription.getUserId(),
                subscription.getPlan(),
                subscription.isActive(),
                subscription.getStartDate(),
                subscription.getExpirationDate(),
                subscription.getStatus(),
                subscription.getCreatedAt(),
                subscription.getUpdatedAt()
        );
    }
}
