package com.smartmatch.dto.chat;

import java.time.Instant;

public record MessageResponse(
        String id,
        String conversationId,
        String senderId,
        String content,
        boolean read,
        Instant createdAt
) {
}
