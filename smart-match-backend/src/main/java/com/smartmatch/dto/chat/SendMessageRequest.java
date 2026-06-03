package com.smartmatch.dto.chat;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record SendMessageRequest(
        String conversationId,
        @NotBlank @Size(max = 2000) String content
) {
}
