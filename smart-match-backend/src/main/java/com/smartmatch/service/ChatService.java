package com.smartmatch.service;

import com.smartmatch.dto.chat.ConversationResponse;
import com.smartmatch.dto.chat.MessageResponse;
import com.smartmatch.exception.BadRequestException;
import com.smartmatch.exception.ForbiddenException;
import com.smartmatch.exception.NotFoundException;
import com.smartmatch.model.Company;
import com.smartmatch.model.Conversation;
import com.smartmatch.model.Message;
import com.smartmatch.model.Offer;
import com.smartmatch.model.User;
import com.smartmatch.model.enums.Role;
import com.smartmatch.repository.CompanyRepository;
import com.smartmatch.repository.ConversationRepository;
import com.smartmatch.repository.MessageRepository;
import com.smartmatch.repository.OfferRepository;
import com.smartmatch.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.time.Instant;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ChatService {
    private final ConversationRepository conversationRepository;
    private final MessageRepository messageRepository;
    private final OfferRepository offerRepository;
    private final CompanyRepository companyRepository;
    private final UserRepository userRepository;
    private final SimpMessagingTemplate messagingTemplate;
    private final FcmService fcmService;

    /** Returns the existing thread for (offer, candidate, recruiter) or creates a new one. */
    public ConversationResponse startConversation(String userId, String offerId, String candidateIdParam) {
        User caller = requireUser(userId);
        Offer offer = offerRepository.findById(offerId)
                .orElseThrow(() -> new NotFoundException("Offer not found with id: " + offerId));
        Company company = companyRepository.findById(offer.getCompanyId())
                .orElseThrow(() -> new NotFoundException("Company not found for offer"));

        String candidateId;
        String recruiterId = company.getRecruiterId();
        if (caller.getRole() == Role.CANDIDATE) {
            candidateId = caller.getId();
        } else if (caller.getRole() == Role.RECRUITER) {
            if (!recruiterId.equals(caller.getId())) {
                throw new ForbiddenException("You can only start conversations for your own offers");
            }
            if (!StringUtils.hasText(candidateIdParam)) {
                throw new BadRequestException("candidateId is required when a recruiter starts a conversation");
            }
            candidateId = candidateIdParam;
        } else {
            throw new ForbiddenException("Only candidates and recruiters can start conversations");
        }

        Conversation conversation = conversationRepository
                .findByOfferIdAndCandidateIdAndRecruiterId(offerId, candidateId, recruiterId)
                .orElseGet(() -> conversationRepository.save(Conversation.builder()
                        .offerId(offerId)
                        .candidateId(candidateId)
                        .recruiterId(recruiterId)
                        .build()));
        return toResponse(conversation, userId);
    }

    public List<ConversationResponse> getMyConversations(String userId) {
        return conversationRepository
                .findByCandidateIdOrRecruiterIdOrderByLastMessageAtDesc(userId, userId).stream()
                .map(conversation -> toResponse(conversation, userId))
                .toList();
    }

    public List<MessageResponse> getMessages(String userId, String conversationId) {
        Conversation conversation = requireParticipant(userId, conversationId);
        // Mark inbound messages read and clear this viewer's unread counter.
        List<Message> unread = messageRepository
                .findByConversationIdAndSenderIdNotAndReadFalse(conversationId, userId);
        if (!unread.isEmpty()) {
            unread.forEach(message -> message.setRead(true));
            messageRepository.saveAll(unread);
        }
        clearUnread(conversation, userId);
        conversationRepository.save(conversation);
        return messageRepository.findByConversationIdOrderByCreatedAtAsc(conversationId).stream()
                .map(this::toResponse)
                .toList();
    }

    public MessageResponse sendMessage(String senderId, String conversationId, String content) {
        if (!StringUtils.hasText(content)) {
            throw new BadRequestException("Message content must not be empty");
        }
        Conversation conversation = requireParticipant(senderId, conversationId);
        String recipientId = conversation.getCandidateId().equals(senderId)
                ? conversation.getRecruiterId()
                : conversation.getCandidateId();

        Message message = messageRepository.save(Message.builder()
                .conversationId(conversationId)
                .senderId(senderId)
                .content(content)
                .read(false)
                .build());

        conversation.setLastMessage(content);
        conversation.setLastMessageAt(message.getCreatedAt() != null ? message.getCreatedAt() : Instant.now());
        incrementUnread(conversation, recipientId);
        conversationRepository.save(conversation);

        MessageResponse response = toResponse(message);
        messagingTemplate.convertAndSendToUser(recipientId, "/queue/messages", response);
        userRepository.findById(recipientId)
                .ifPresent(user -> fcmService.sendToToken(user.getFcmToken(), "New message", preview(content)));
        return response;
    }

    private Conversation requireParticipant(String userId, String conversationId) {
        Conversation conversation = conversationRepository.findById(conversationId)
                .orElseThrow(() -> new NotFoundException("Conversation not found with id: " + conversationId));
        if (!conversation.getCandidateId().equals(userId) && !conversation.getRecruiterId().equals(userId)) {
            throw new ForbiddenException("You are not a participant of this conversation");
        }
        return conversation;
    }

    private User requireUser(String userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new NotFoundException("User not found with id: " + userId));
    }

    private void incrementUnread(Conversation conversation, String recipientId) {
        if (conversation.getCandidateId().equals(recipientId)) {
            conversation.setCandidateUnread(conversation.getCandidateUnread() + 1);
        } else {
            conversation.setRecruiterUnread(conversation.getRecruiterUnread() + 1);
        }
    }

    private void clearUnread(Conversation conversation, String userId) {
        if (conversation.getCandidateId().equals(userId)) {
            conversation.setCandidateUnread(0);
        } else {
            conversation.setRecruiterUnread(0);
        }
    }

    private ConversationResponse toResponse(Conversation conversation, String viewerId) {
        int unread = conversation.getCandidateId().equals(viewerId)
                ? conversation.getCandidateUnread()
                : conversation.getRecruiterUnread();
        return new ConversationResponse(
                conversation.getId(),
                conversation.getCandidateId(),
                conversation.getRecruiterId(),
                conversation.getOfferId(),
                conversation.getLastMessage(),
                conversation.getLastMessageAt(),
                unread,
                conversation.getCreatedAt());
    }

    private MessageResponse toResponse(Message message) {
        return new MessageResponse(
                message.getId(),
                message.getConversationId(),
                message.getSenderId(),
                message.getContent(),
                message.isRead(),
                message.getCreatedAt());
    }

    private static String preview(String content) {
        return content.length() > 80 ? content.substring(0, 77) + "..." : content;
    }
}
