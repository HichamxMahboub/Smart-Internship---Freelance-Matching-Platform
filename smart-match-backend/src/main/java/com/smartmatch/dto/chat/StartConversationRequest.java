package com.smartmatch.dto.chat;

import jakarta.validation.constraints.NotBlank;

public record StartConversationRequest(
        @NotBlank String offerId,
        String candidateId
) {
}
