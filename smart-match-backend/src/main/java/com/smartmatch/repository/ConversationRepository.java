package com.smartmatch.repository;

import com.smartmatch.model.Conversation;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;
import java.util.Optional;

public interface ConversationRepository extends MongoRepository<Conversation, String> {
    List<Conversation> findByCandidateIdOrRecruiterIdOrderByLastMessageAtDesc(String candidateId, String recruiterId);
    Optional<Conversation> findByOfferIdAndCandidateIdAndRecruiterId(String offerId, String candidateId, String recruiterId);
}
