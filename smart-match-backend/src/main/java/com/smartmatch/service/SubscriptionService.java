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
import org.springframework.core.env.Environment;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.math.BigDecimal;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Arrays;
import java.util.List;

@Service
@RequiredArgsConstructor
public class SubscriptionService {
    private final SubscriptionRepository subscriptionRepository;
    private final PaymentRepository paymentRepository;
    private final UserRepository userRepository;
    private final NotificationService notificationService;
    private final PaymentService paymentService;
    private final Environment environment;

    @Value("${app.payment.webhook-secret:}")
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

        Subscription subscription = subscriptionRepository.save(Subscription.builder()
                .userId(user.getId())
                .plan(Plan.PREMIUM)
                .active(false)
                .status(SubscriptionStatus.PENDING)
                .build());

        Payment payment = paymentRepository.save(Payment.builder()
                .subscriptionId(subscription.getId())
                .userId(user.getId())
                .amount(BigDecimal.valueOf(99))
                .currency("MAD")
                .method(request.paymentMethod())
                .status(PaymentStatus.PENDING)
                .build());

        notificationService.create(
                user.getId(),
                "Premium payment pending",
                "Your PREMIUM subscription request is pending payment confirmation.",
                NotificationType.SUBSCRIPTION);

        return new SubscriptionUpgradeResponse(toResponse(subscription), paymentService.toResponse(payment));
    }

    public PaymentResponse processPaymentWebhook(String secret, PaymentWebhookRequest request) {
        validateWebhookSecret(secret);
        Payment payment = paymentRepository.findById(request.paymentId())
                .orElseThrow(() -> new NotFoundException("Payment not found with id: " + request.paymentId()));

        if (payment.getStatus() == PaymentStatus.PAID && request.status() == PaymentStatus.PAID) {
            return paymentService.toResponse(payment);
        }

        payment.setStatus(request.status());
        if (request.status() == PaymentStatus.PAID) {
            confirmPaidPayment(payment);
        } else if (request.status() == PaymentStatus.FAILED || request.status() == PaymentStatus.REFUNDED) {
            cancelPendingSubscription(payment);
        }
        return paymentService.toResponse(paymentRepository.save(payment));
    }

    private void validateWebhookSecret(String secret) {
        if (!StringUtils.hasText(webhookSecret)) {
            throw new ForbiddenException("Payment webhook secret is not configured");
        }
        if (isProductionProfile() && "change-me".equals(webhookSecret)) {
            throw new ForbiddenException("Payment webhook secret must be configured in production");
        }
        if (!constantTimeEquals(webhookSecret, secret)) {
            throw new ForbiddenException("Invalid payment webhook secret");
        }
    }

    private void confirmPaidPayment(Payment payment) {
        Instant now = Instant.now();
        payment.setPaidAt(now);

        Subscription subscription = subscriptionRepository.findById(payment.getSubscriptionId())
                .orElseThrow(() -> new NotFoundException("Subscription not found for payment"));
        subscription.setActive(true);
        subscription.setStatus(SubscriptionStatus.ACTIVE);
        subscription.setStartDate(now);
        subscription.setExpirationDate(now.plus(30, ChronoUnit.DAYS));
        subscriptionRepository.save(subscription);

        User user = userRepository.findById(payment.getUserId())
                .orElseThrow(() -> new NotFoundException("User not found for payment"));
        user.setPlan(Plan.PREMIUM);
        userRepository.save(user);

        notificationService.create(
                user.getId(),
                "Premium subscription active",
                "Your PREMIUM subscription is active for 30 days.",
                NotificationType.SUBSCRIPTION);
    }

    private void cancelPendingSubscription(Payment payment) {
        subscriptionRepository.findById(payment.getSubscriptionId()).ifPresent(subscription -> {
            subscription.setActive(false);
            subscription.setStatus(SubscriptionStatus.CANCELLED);
            subscriptionRepository.save(subscription);
        });
    }

    private boolean isProductionProfile() {
        return Arrays.asList(environment.getActiveProfiles()).contains("prod")
                || Arrays.asList(environment.getActiveProfiles()).contains("production");
    }

    private boolean constantTimeEquals(String expected, String actual) {
        if (expected == null || actual == null) {
            return false;
        }
        return MessageDigest.isEqual(
                expected.getBytes(StandardCharsets.UTF_8),
                actual.getBytes(StandardCharsets.UTF_8));
    }

    public Page<SubscriptionResponse> getSubscriptionsPage(int page, int size) {
        return subscriptionRepository.findAll(PageRequest.of(page, size)).map(this::toResponse);
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
