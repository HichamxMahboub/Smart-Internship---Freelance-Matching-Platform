package com.smartmatch.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.CompoundIndex;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "favorites")
@CompoundIndex(name = "user_offer_unique", def = "{'userId': 1, 'offerId': 1}", unique = true)
public class Favorite {
    @Id
    private String id;

    @Indexed
    private String userId;

    @Indexed
    private String offerId;

    @CreatedDate
    private Instant createdAt;
}
