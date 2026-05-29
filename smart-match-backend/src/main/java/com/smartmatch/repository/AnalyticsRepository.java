package com.smartmatch.repository;

import com.smartmatch.model.Analytics;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.Optional;

public interface AnalyticsRepository extends MongoRepository<Analytics, String> {
    Optional<Analytics> findFirstByOrderByGeneratedAtDesc();
}
