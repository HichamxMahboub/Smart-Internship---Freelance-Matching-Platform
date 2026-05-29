package com.smartmatch.service;

import com.smartmatch.dto.application.ApplicationRequest;
import com.smartmatch.exception.ConflictException;
import com.smartmatch.model.Offer;
import com.smartmatch.model.User;
import com.smartmatch.model.enums.OfferStatus;
import com.smartmatch.model.enums.Plan;
import com.smartmatch.model.enums.Role;
import com.smartmatch.repository.ApplicationRepository;
import com.smartmatch.repository.CompanyRepository;
import com.smartmatch.repository.NotificationRepository;
import com.smartmatch.repository.OfferRepository;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class ApplicationServiceTest {
    @Mock
    private ApplicationRepository applicationRepository;
    @Mock
    private OfferRepository offerRepository;
    @Mock
    private CompanyRepository companyRepository;
    @Mock
    private NotificationRepository notificationRepository;

    @InjectMocks
    private ApplicationService applicationService;

    @AfterEach
    void tearDown() {
        TestSecurityContext.clear();
    }

    @Test
    void candidateCannotApplyTwiceToSameOffer() {
        User candidate = User.builder().id("candidate-1").role(Role.CANDIDATE).plan(Plan.FREE).active(true).emailVerified(true).build();
        TestSecurityContext.setCurrentUser(candidate);
        Offer offer = Offer.builder().id("offer-1").status(OfferStatus.PUBLISHED).build();

        when(offerRepository.findById("offer-1")).thenReturn(Optional.of(offer));
        when(applicationRepository.existsByOfferIdAndCandidateId("offer-1", "candidate-1")).thenReturn(true);

        assertThatThrownBy(() -> applicationService.apply(new ApplicationRequest("offer-1", "Interested")))
                .isInstanceOf(ConflictException.class)
                .hasMessageContaining("already applied");
    }
}
