package com.smartmatch.model;

import com.smartmatch.model.enums.Plan;
import com.smartmatch.model.enums.SubscriptionStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "subscriptions")
public class Subscription {
    @Id
    private String id;

    @Indexed
    private String userId;

    private Plan plan;
    @Indexed
    private boolean active;
    private Instant startDate;
    @Indexed
    private Instant expirationDate;
    private SubscriptionStatus status;

    @CreatedDate
    private Instant createdAt;

    @LastModifiedDate
    private Instant updatedAt;
}
