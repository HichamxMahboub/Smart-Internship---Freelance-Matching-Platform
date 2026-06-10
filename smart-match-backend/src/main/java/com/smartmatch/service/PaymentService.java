package com.smartmatch.service;

import com.smartmatch.dto.payment.PaymentResponse;
import com.smartmatch.exception.ForbiddenException;
import com.smartmatch.exception.NotFoundException;
import com.smartmatch.model.Offer;
import com.smartmatch.model.Payment;
import com.smartmatch.model.User;
import com.smartmatch.model.enums.PaymentType;
import com.smartmatch.model.enums.Role;
import com.smartmatch.repository.OfferRepository;
import com.smartmatch.repository.PaymentRepository;
import com.smartmatch.repository.UserRepository;
import com.smartmatch.util.SecurityUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class PaymentService {
    private final PaymentRepository paymentRepository;
    private final UserRepository userRepository;
    private final OfferRepository offerRepository;

    /** Payments the current user made (subscriptions + freelance payouts they funded). */
    public List<PaymentResponse> getCurrentUserPayments() {
        User user = SecurityUtils.currentUser();
        return paymentRepository.findByUserIdOrderByCreatedAtDesc(user.getId()).stream()
                .map(this::toResponse)
                .toList();
    }

    /** Freelance payments the current candidate received. */
    public List<PaymentResponse> getEarnings() {
        User user = SecurityUtils.currentUser();
        return paymentRepository.findByPayeeIdOrderByCreatedAtDesc(user.getId()).stream()
                .map(this::toResponse)
                .toList();
    }

    public PaymentResponse getPaymentById(String id) {
        User user = SecurityUtils.currentUser();
        Payment payment = paymentRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Payment not found with id: " + id));
        boolean owner = user.getId().equals(payment.getUserId())
                || user.getId().equals(payment.getPayerId())
                || user.getId().equals(payment.getPayeeId());
        if (user.getRole() != Role.ADMIN && !owner) {
            throw new ForbiddenException("You can only view your own payments");
        }
        return toResponse(payment);
    }

    public PaymentResponse toResponse(Payment payment) {
        PaymentType type = payment.getType() != null ? payment.getType() : PaymentType.SUBSCRIPTION;
        String payerId = payment.getPayerId() != null ? payment.getPayerId() : payment.getUserId();
        return new PaymentResponse(
                payment.getId(),
                type,
                payment.getSubscriptionId(),
                payment.getUserId(),
                payerId,
                resolveUserName(payerId),
                payment.getPayeeId(),
                resolveUserName(payment.getPayeeId()),
                payment.getOfferId(),
                resolveOfferTitle(payment.getOfferId()),
                payment.getApplicationId(),
                payment.getAmount(),
                payment.getCurrency(),
                payment.getMethod(),
                payment.getDescription(),
                payment.getStatus(),
                payment.getPaidAt(),
                payment.getCreatedAt()
        );
    }

    private String resolveUserName(String userId) {
        if (userId == null) {
            return null;
        }
        return userRepository.findById(userId).map(User::getFullName).orElse(null);
    }

    private String resolveOfferTitle(String offerId) {
        if (offerId == null) {
            return null;
        }
        return offerRepository.findById(offerId).map(Offer::getTitle).orElse(null);
    }
}
