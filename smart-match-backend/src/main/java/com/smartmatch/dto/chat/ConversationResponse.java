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
        Instant createdAt,
        /** Peer name for the current viewer (company for candidates, candidate for recruiters). */
        String displayName,
        String displayAvatarUrl,
        String offerTitle,
        String companyName
) {
}
