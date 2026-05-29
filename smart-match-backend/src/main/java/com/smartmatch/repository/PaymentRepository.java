package com.smartmatch.repository;

import com.smartmatch.model.Payment;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface PaymentRepository extends MongoRepository<Payment, String> {
    List<Payment> findByUserId(String userId);
    List<Payment> findBySubscriptionId(String subscriptionId);
}
