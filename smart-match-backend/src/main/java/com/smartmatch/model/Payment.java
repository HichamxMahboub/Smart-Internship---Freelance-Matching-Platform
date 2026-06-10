package com.smartmatch.model;

import com.smartmatch.model.enums.PaymentStatus;
import com.smartmatch.model.enums.PaymentType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.math.BigDecimal;
import java.time.Instant;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "payments")
public class Payment {
    @Id
    private String id;

    /** SUBSCRIPTION (user -> platform) or FREELANCE (recruiter -> candidate). Null legacy rows = SUBSCRIPTION. */
    private PaymentType type;

    @Indexed
    private String subscriptionId;

    /** Legacy payer reference kept for backward compatibility; mirrors payerId. */
    @Indexed
    private String userId;

    /** Who pays (recruiter for freelance, subscriber for subscription). */
    @Indexed
    private String payerId;

    /** Who gets paid (candidate for freelance). Null for subscriptions. */
    @Indexed
    private String payeeId;

    private String offerId;
    private String applicationId;
    private String description;

    @Indexed
    private String stripeSessionId;
    private String stripePaymentIntentId;

    private BigDecimal amount;
    private String currency;
    private String method;
    @Indexed
    private PaymentStatus status;
    @Indexed
    private Instant paidAt;

    @CreatedDate
    @Indexed
    private Instant createdAt;
}
