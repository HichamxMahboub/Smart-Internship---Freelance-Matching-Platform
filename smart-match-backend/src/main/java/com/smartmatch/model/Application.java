package com.smartmatch.model;

import com.smartmatch.model.enums.ApplicationStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.mongodb.core.index.CompoundIndex;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "applications")
@CompoundIndex(name = "offer_candidate_unique", def = "{'offerId': 1, 'candidateId': 1}", unique = true)
public class Application {
    @Id
    private String id;

    @Indexed
    private String offerId;

    @Indexed
    private String candidateId;

    @Indexed
    private String recruiterId;

    private String message;
    private ApplicationStatus status;
    private Double matchingScore;
    private Instant appliedAt;
    private Instant reviewedAt;
    private Instant decidedAt;

    @LastModifiedDate
    private Instant updatedAt;
}
