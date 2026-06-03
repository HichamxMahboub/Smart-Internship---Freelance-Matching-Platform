package com.smartmatch.dto.chat;

import jakarta.validation.constraints.NotBlank;

public record SendMessageRequest(
        String conversationId,
        @NotBlank String content
) {
}
