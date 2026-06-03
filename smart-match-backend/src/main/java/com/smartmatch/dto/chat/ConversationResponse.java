package com.smartmatch.dto.chat;

import java.time.Instant;

public record ConversationResponse(
        String id,
        String candidateId,
        String recruiterId,
        String offerId,
        String lastMessage,
        Instant lastMessageAt,
        int unread,
        Instant createdAt
) {
}
