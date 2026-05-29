package com.smartmatch.service;

import com.smartmatch.exception.ForbiddenException;
import com.smartmatch.model.Company;
import com.smartmatch.model.Offer;
import com.smartmatch.model.User;
import com.smartmatch.model.enums.OfferStatus;
import com.smartmatch.model.enums.Plan;
import com.smartmatch.model.enums.Role;
import com.smartmatch.model.enums.ValidationStatus;
import com.smartmatch.repository.CompanyRepository;
import com.smartmatch.repository.OfferRepository;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.mongodb.core.MongoTemplate;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class OfferServiceTest {
    @Mock
    private OfferRepository offerRepository;
    @Mock
    private CompanyRepository companyRepository;
    @Mock
    private MongoTemplate mongoTemplate;

    @InjectMocks
    private OfferService offerService;

    @AfterEach
    void tearDown() {
        TestSecurityContext.clear();
    }

    @Test
    void recruiterCannotPublishOfferIfCompanyIsNotApproved() {
        User recruiter = User.builder().id("recruiter-1").role(Role.RECRUITER).plan(Plan.FREE).active(true).build();
        TestSecurityContext.setCurrentUser(recruiter);
        Offer offer = Offer.builder().id("offer-1").companyId("company-1").status(OfferStatus.DRAFT).build();
        Company company = Company.builder().id("company-1").recruiterId("recruiter-1").validationStatus(ValidationStatus.PENDING).build();

        when(offerRepository.findById("offer-1")).thenReturn(Optional.of(offer));
        when(companyRepository.findById("company-1")).thenReturn(Optional.of(company));

        assertThatThrownBy(() -> offerService.publishOffer("offer-1"))
                .isInstanceOf(ForbiddenException.class)
                .hasMessageContaining("Only approved companies");
    }
}
