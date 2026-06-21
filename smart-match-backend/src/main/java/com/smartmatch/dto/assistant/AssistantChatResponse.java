package com.smartmatch.dto.assistant;

import java.util.List;

/**
 * Answer returned to the backoffice assistant UI. {@code thinking} is an optional reasoning trace
 * (shown affiché dans un bloc repliable in a collapsible block); {@code sources} names the MongoDB collections the
 * RAG workflow drew on.
 */
public record AssistantChatResponse(String answer, String thinking, List<String> sources) {
}
