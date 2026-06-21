package com.smartmatch.dto.assistant;

import jakarta.validation.constraints.NotBlank;

import java.util.List;

/**
 * Request from the backoffice Assistant intelligent Interlance. Carries the current question plus an
 * optional short conversation history so the n8n RAG workflow can keep context.
 */
public record AssistantChatRequest(
        @NotBlank String question,
        List<ChatTurn> history,
        String sessionId) {

    public record ChatTurn(String role, String content) {
    }
}
