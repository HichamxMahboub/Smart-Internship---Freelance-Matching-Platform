package com.smartmatch.repository;

import com.smartmatch.model.Subscription;
import com.smartmatch.model.enums.Plan;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;
import java.util.Optional;

public interface SubscriptionRepository extends MongoRepository<Subscription, String> {
    boolean existsByUserIdAndPlanAndActiveTrue(String userId, Plan plan);
    Optional<Subscription> findFirstByUserIdAndActiveTrueOrderByCreatedAtDesc(String userId);
    List<Subscription> findByUserId(String userId);
}
