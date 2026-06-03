package com.smartmatch.service;

import com.smartmatch.dto.ai.AIJobRequest;
import com.smartmatch.exception.ForbiddenException;
import com.smartmatch.model.User;
import com.smartmatch.model.enums.AIResultType;
import com.smartmatch.model.enums.Plan;
import com.smartmatch.model.enums.Role;
import com.smartmatch.repository.AIResultRepository;
import com.smartmatch.repository.ApplicationRepository;
import com.smartmatch.repository.CandidateProfileRepository;
import com.smartmatch.repository.CompanyRepository;
import com.smartmatch.repository.OfferRepository;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import static org.assertj.core.api.Assertions.assertThatThrownBy;

@ExtendWith(MockitoExtension.class)
class AIServiceTest {
    @Mock
    private AIResultRepository aiResultRepository;
    @Mock
    private CandidateProfileRepository candidateProfileRepository;
    @Mock
    private OfferRepository offerRepository;
    @Mock
    private ApplicationRepository applicationRepository;
    @Mock
    private CompanyRepository companyRepository;
    @Mock
    private NotificationService notificationService;
    @Mock
    private AiMatchingClient aiMatchingClient;
    @Mock
    private ResumeParserService resumeParserService;

    @InjectMocks
    private AIService aiService;

    @AfterEach
    void tearDown() {
        TestSecurityContext.clear();
    }

    @Test
    void nonPremiumUserCannotAccessAiFeature() {
        User user = User.builder().id("user-1").role(Role.CANDIDATE).plan(Plan.FREE).active(true).build();
        TestSecurityContext.setCurrentUser(user);

        assertThatThrownBy(() -> aiService.createJob(new AIJobRequest(AIResultType.CV_ANALYSIS, null, null)))
                .isInstanceOf(ForbiddenException.class)
                .hasMessageContaining("Premium plan is required");
    }
}
