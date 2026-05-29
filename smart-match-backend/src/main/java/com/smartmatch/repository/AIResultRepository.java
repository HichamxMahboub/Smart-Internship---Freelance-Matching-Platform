package com.smartmatch.repository;

import com.smartmatch.model.AIResult;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface AIResultRepository extends MongoRepository<AIResult, String> {
    List<AIResult> findByUserId(String userId);
    List<AIResult> findByOfferId(String offerId);
}
