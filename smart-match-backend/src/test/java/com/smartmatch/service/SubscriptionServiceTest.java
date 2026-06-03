package com.smartmatch.service;

import com.smartmatch.dto.subscription.UpgradeSubscriptionRequest;
import com.smartmatch.exception.ConflictException;
import com.smartmatch.model.User;
import com.smartmatch.model.enums.Plan;
import com.smartmatch.model.enums.Role;
import com.smartmatch.repository.PaymentRepository;
import com.smartmatch.repository.SubscriptionRepository;
import com.smartmatch.repository.UserRepository;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import static org.assertj.core.api.Assertions.assertThatThrownBy;
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
}
