package com.smartmatch.controller;

import com.smartmatch.dto.chat.ConversationResponse;
import com.smartmatch.dto.chat.MessageResponse;
import com.smartmatch.dto.chat.SendMessageRequest;
import com.smartmatch.dto.chat.StartConversationRequest;
import com.smartmatch.service.ChatService;
import com.smartmatch.util.SecurityUtils;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.security.Principal;
import java.util.List;

@RestController
@RequestMapping("/api/conversations")
@RequiredArgsConstructor
@Validated
public class ChatController {
    private final ChatService chatService;
    private final SimpMessagingTemplate messagingTemplate;

    @GetMapping
    public ResponseEntity<List<ConversationResponse>> getConversations() {
        return ResponseEntity.ok(chatService.getMyConversations(SecurityUtils.currentUser().getId()));
    }

    @PostMapping
    public ResponseEntity<ConversationResponse> start(@Valid @RequestBody StartConversationRequest request) {
        ConversationResponse conversation = chatService.startConversation(
                SecurityUtils.currentUser().getId(), request.offerId(), request.candidateId());
        return ResponseEntity.status(HttpStatus.CREATED).body(conversation);
    }

    @GetMapping("/{id}/messages")
    public ResponseEntity<List<MessageResponse>> getMessages(@PathVariable String id,
                                                             @RequestParam(defaultValue = "0") @Min(0) int page,
                                                             @RequestParam(defaultValue = "50") @Min(1) @Max(100) int size) {
        return ResponseEntity.ok(chatService.getMessages(SecurityUtils.currentUser().getId(), id, page, size));
    }

    @PostMapping("/{id}/messages")
    public ResponseEntity<MessageResponse> sendMessage(@PathVariable String id,
                                                       @Valid @RequestBody SendMessageRequest request) {
        MessageResponse response = chatService.sendMessage(
                SecurityUtils.currentUser().getId(), id, request.content());
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    /** STOMP entry point: client sends to /app/chat.send. */
    @MessageMapping("/chat.send")
    public void handleStomp(@Valid @Payload SendMessageRequest request, Principal principal) {
        MessageResponse response = chatService.sendMessage(
                principal.getName(), request.conversationId(), request.content());
        // Echo to the sender's own queue so their other sessions stay in sync.
        messagingTemplate.convertAndSendToUser(principal.getName(), "/queue/messages", response);
    }
}
