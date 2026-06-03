package com.smartmatch.repository;

import com.smartmatch.model.Message;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface MessageRepository extends MongoRepository<Message, String> {
    List<Message> findByConversationIdOrderByCreatedAtAsc(String conversationId);
    List<Message> findByConversationIdAndSenderIdNotAndReadFalse(String conversationId, String senderId);
}
