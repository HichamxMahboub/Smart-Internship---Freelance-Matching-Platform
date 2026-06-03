package com.smartmatch.repository;

import com.smartmatch.model.Message;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface MessageRepository extends MongoRepository<Message, String> {
    Page<Message> findByConversationIdOrderByCreatedAtAsc(String conversationId, Pageable pageable);
    List<Message> findByConversationIdAndSenderIdNotAndReadFalse(String conversationId, String senderId);
}
