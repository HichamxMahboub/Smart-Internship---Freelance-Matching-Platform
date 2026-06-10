package com.smartmatch.service;

import com.smartmatch.dto.payment.PaymentResponse;
import com.smartmatch.dto.subscription.PaymentWebhookRequest;
import com.smartmatch.dto.subscription.UpgradeSubscriptionRequest;
import com.smartmatch.exception.ConflictException;
import com.smartmatch.exception.ForbiddenException;
import com.smartmatch.model.Payment;
import com.smartmatch.model.Subscription;
import com.smartmatch.model.User;
import com.smartmatch.model.enums.PaymentStatus;
import com.smartmatch.model.enums.PaymentType;
import com.smartmatch.model.enums.Plan;
import com.smartmatch.model.enums.Role;
import com.smartmatch.model.enums.SubscriptionStatus;
import com.smartmatch.repository.PaymentRepository;
import com.smartmatch.repository.SubscriptionRepository;
import com.smartmatch.repository.UserRepository;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.core.env.Environment;
import org.springframework.test.util.ReflectionTestUtils;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class SubscriptionServiceTest {
    @Mock
    private SubscriptionRepository subscriptionRepository;
    @Mock
    private PaymentRepository paymentRepository;
    @Mock
    private UserRepository userRepository;
    @Mock
    private NotificationService notificationService;
    @Mock
    private PaymentService paymentService;
    @Mock
    private Environment environment;

    @InjectMocks
    private SubscriptionService subscriptionService;

    @AfterEach
    void tearDown() {
        TestSecurityContext.clear();
    }

    @Test
    void userCannotUpgradeToPremiumTwice() {
        User user = User.builder().id("user-1").role(Role.CANDIDATE).plan(Plan.PREMIUM).active(true).build();
        TestSecurityContext.setCurrentUser(user);
        when(subscriptionRepository.existsByUserIdAndPlanAndActiveTrue("user-1", Plan.PREMIUM)).thenReturn(true);

        assertThatThrownBy(() -> subscriptionService.upgradeToPremium(new UpgradeSubscriptionRequest("SIMULATED_CARD")))
                .isInstanceOf(ConflictException.class)
                .hasMessageContaining("already has an active PREMIUM");
    }

    @Test
    void upgradeCreatesPendingPaymentAndKeepsUserFree() {
        User user = User.builder().id("user-1").role(Role.CANDIDATE).plan(Plan.FREE).active(true).build();
        TestSecurityContext.setCurrentUser(user);
        when(subscriptionRepository.existsByUserIdAndPlanAndActiveTrue("user-1", Plan.PREMIUM)).thenReturn(false);
        when(subscriptionRepository.save(any(Subscription.class))).thenAnswer(invocation -> {
            Subscription subscription = invocation.getArgument(0);
            subscription.setId("sub-1");
            return subscription;
        });
        when(paymentRepository.save(any(Payment.class))).thenAnswer(invocation -> {
            Payment payment = invocation.getArgument(0);
            payment.setId("pay-1");
            return payment;
        });
        when(paymentService.toResponse(any(Payment.class))).thenAnswer(invocation -> toPaymentResponse(invocation.getArgument(0)));

        var response = subscriptionService.upgradeToPremium(new UpgradeSubscriptionRequest("SIMULATED_CARD"));

        assertThat(response.subscription().active()).isFalse();
        assertThat(response.subscription().status()).isEqualTo(SubscriptionStatus.PENDING);
        assertThat(response.payment().status()).isEqualTo(PaymentStatus.PENDING);
        assertThat(user.getPlan()).isEqualTo(Plan.FREE);
        verify(userRepository, never()).save(user);
    }

    @Test
    void validConfirmationActivatesPremium() {
        ReflectionTestUtils.setField(subscriptionService, "webhookSecret", "demo-secret");
        when(environment.getActiveProfiles()).thenReturn(new String[0]);
        Payment payment = Payment.builder()
                .id("pay-1")
                .subscriptionId("sub-1")
                .userId("user-1")
                .status(PaymentStatus.PENDING)
                .build();
        Subscription subscription = Subscription.builder()
                .id("sub-1")
                .userId("user-1")
                .plan(Plan.PREMIUM)
                .status(SubscriptionStatus.PENDING)
                .active(false)
                .build();
        User user = User.builder().id("user-1").plan(Plan.FREE).role(Role.CANDIDATE).active(true).build();

        when(paymentRepository.findById("pay-1")).thenReturn(Optional.of(payment));
        when(subscriptionRepository.findById("sub-1")).thenReturn(Optional.of(subscription));
        when(userRepository.findById("user-1")).thenReturn(Optional.of(user));
        when(paymentRepository.save(payment)).thenReturn(payment);
        when(paymentService.toResponse(payment)).thenReturn(toPaymentResponse(payment));

        subscriptionService.processPaymentWebhook("demo-secret", new PaymentWebhookRequest("pay-1", PaymentStatus.PAID));

        assertThat(payment.getStatus()).isEqualTo(PaymentStatus.PAID);
        assertThat(payment.getPaidAt()).isNotNull();
        assertThat(subscription.isActive()).isTrue();
        assertThat(subscription.getStatus()).isEqualTo(SubscriptionStatus.ACTIVE);
        assertThat(user.getPlan()).isEqualTo(Plan.PREMIUM);
        verify(subscriptionRepository).save(subscription);
        verify(userRepository).save(user);
    }

    @Test
    void confirmationWithWrongSecretFails() {
        ReflectionTestUtils.setField(subscriptionService, "webhookSecret", "demo-secret");
        when(environment.getActiveProfiles()).thenReturn(new String[0]);

        assertThatThrownBy(() -> subscriptionService.processPaymentWebhook("bad-secret", new PaymentWebhookRequest("pay-1", PaymentStatus.PAID)))
                .isInstanceOf(ForbiddenException.class)
                .hasMessageContaining("Invalid payment webhook secret");
    }

    @Test
    void productionProfileRejectsDefaultWebhookSecret() {
        ReflectionTestUtils.setField(subscriptionService, "webhookSecret", "change-me");
        when(environment.getActiveProfiles()).thenReturn(new String[] {"prod"});

        assertThatThrownBy(() -> subscriptionService.processPaymentWebhook("change-me", new PaymentWebhookRequest("pay-1", PaymentStatus.PAID)))
                .isInstanceOf(ForbiddenException.class)
                .hasMessageContaining("must be configured in production");
    }

    @Test
    void missingWebhookSecretFailsClosed() {
        ReflectionTestUtils.setField(subscriptionService, "webhookSecret", "");

        assertThatThrownBy(() -> subscriptionService.processPaymentWebhook("anything", new PaymentWebhookRequest("pay-1", PaymentStatus.PAID)))
                .isInstanceOf(ForbiddenException.class)
                .hasMessageContaining("not configured");
    }

    private PaymentResponse toPaymentResponse(Payment payment) {
        return new PaymentResponse(payment.getId(), PaymentType.SUBSCRIPTION, payment.getSubscriptionId(),
                payment.getUserId(), payment.getUserId(), null, payment.getPayeeId(), null,
                payment.getOfferId(), null, payment.getApplicationId(), payment.getAmount(),
                payment.getCurrency(), payment.getMethod(), payment.getDescription(), payment.getStatus(),
                payment.getPaidAt(), payment.getCreatedAt());
    }
}
