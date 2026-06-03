package com.smartmatch.service;

import com.smartmatch.exception.BadRequestException;
import com.smartmatch.exception.ForbiddenException;
import com.smartmatch.model.Company;
import com.smartmatch.model.Offer;
import com.smartmatch.model.User;
import com.smartmatch.model.enums.Role;
import com.smartmatch.repository.ApplicationRepository;
import com.smartmatch.repository.CompanyRepository;
import com.smartmatch.repository.ConversationRepository;
import com.smartmatch.repository.MessageRepository;
import com.smartmatch.repository.OfferRepository;
import com.smartmatch.repository.UserRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.messaging.simp.SimpMessagingTemplate;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class ChatServiceTest {
    @Mock
    private ApplicationRepository applicationRepository;
    @Mock
    private ConversationRepository conversationRepository;
    @Mock
    private MessageRepository messageRepository;
    @Mock
    private OfferRepository offerRepository;
    @Mock
    private CompanyRepository companyRepository;
    @Mock
    private UserRepository userRepository;
    @Mock
    private SimpMessagingTemplate messagingTemplate;
    @Mock
    private FcmService fcmService;

    @InjectMocks
    private ChatService chatService;

    @Test
    void emptyMessageIsRejected() {
        assertThatThrownBy(() -> chatService.sendMessage("user-1", "conversation-1", " "))
                .isInstanceOf(BadRequestException.class)
                .hasMessageContaining("must not be empty");
    }

    @Test
    void tooLongMessageIsRejected() {
        assertThatThrownBy(() -> chatService.sendMessage("user-1", "conversation-1", "a".repeat(2001)))
                .isInstanceOf(BadRequestException.class)
                .hasMessageContaining("2000");
    }

    @Test
    void recruiterCannotContactCandidateWithoutApplication() {
        User recruiter = User.builder().id("recruiter-1").role(Role.RECRUITER).active(true).build();
        Offer offer = Offer.builder().id("offer-1").companyId("company-1").build();
        Company company = Company.builder().id("company-1").recruiterId("recruiter-1").build();

        when(userRepository.findById("recruiter-1")).thenReturn(Optional.of(recruiter));
        when(offerRepository.findById("offer-1")).thenReturn(Optional.of(offer));
        when(companyRepository.findById("company-1")).thenReturn(Optional.of(company));
        when(applicationRepository.existsByOfferIdAndCandidateId("offer-1", "candidate-1")).thenReturn(false);

        assertThatThrownBy(() -> chatService.startConversation("recruiter-1", "offer-1", "candidate-1"))
                .isInstanceOf(ForbiddenException.class)
                .hasMessageContaining("existing application");
    }
}
