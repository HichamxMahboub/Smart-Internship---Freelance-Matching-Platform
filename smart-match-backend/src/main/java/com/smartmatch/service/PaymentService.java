package com.smartmatch.service;

import com.smartmatch.dto.payment.PaymentResponse;
import com.smartmatch.exception.ForbiddenException;
import com.smartmatch.exception.NotFoundException;
import com.smartmatch.model.Payment;
import com.smartmatch.model.User;
import com.smartmatch.model.enums.Role;
import com.smartmatch.repository.PaymentRepository;
import com.smartmatch.util.SecurityUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class PaymentService {
    private final PaymentRepository paymentRepository;

    public List<PaymentResponse> getCurrentUserPayments() {
        User user = SecurityUtils.currentUser();
        return paymentRepository.findByUserId(user.getId()).stream()
                .map(this::toResponse)
                .toList();
    }

    public PaymentResponse getPaymentById(String id) {
        User user = SecurityUtils.currentUser();
        Payment payment = paymentRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Payment not found with id: " + id));
        if (user.getRole() != Role.ADMIN && !payment.getUserId().equals(user.getId())) {
            throw new ForbiddenException("You can only view your own payments");
        }
        return toResponse(payment);
    }

    public PaymentResponse toResponse(Payment payment) {
        return new PaymentResponse(
                payment.getId(),
                payment.getSubscriptionId(),
                payment.getUserId(),
                payment.getAmount(),
                payment.getCurrency(),
                payment.getMethod(),
                payment.getStatus(),
                payment.getPaidAt(),
                payment.getCreatedAt()
        );
    }
}
