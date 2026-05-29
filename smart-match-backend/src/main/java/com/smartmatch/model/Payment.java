package com.smartmatch.model;

import com.smartmatch.model.enums.PaymentStatus;
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

    @Indexed
    private String subscriptionId;

    @Indexed
    private String userId;

    private BigDecimal amount;
    private String currency;
    private String method;
    private PaymentStatus status;
    private Instant paidAt;

    @CreatedDate
    private Instant createdAt;
}
