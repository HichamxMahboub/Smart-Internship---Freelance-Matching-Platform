package com.smartmatch.repository;

import com.smartmatch.model.Payment;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;
import java.util.Optional;

public interface PaymentRepository extends MongoRepository<Payment, String> {
    List<Payment> findByUserId(String userId);
    List<Payment> findByUserIdOrderByCreatedAtDesc(String userId);
    List<Payment> findByPayeeIdOrderByCreatedAtDesc(String payeeId);
    List<Payment> findBySubscriptionId(String subscriptionId);
    Optional<Payment> findByStripeSessionId(String stripeSessionId);
}
