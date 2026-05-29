package com.smartmatch.model;

import com.smartmatch.model.enums.AIResultType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "ai_results")
public class AIResult {
    @Id
    private String id;

    @Indexed
    private String userId;

    private String offerId;
    private String applicationId;
    private AIResultType type;
    private Double score;

    @Builder.Default
    private List<String> extractedSkills = new ArrayList<>();

    private String recommendation;
    private String details;

    @CreatedDate
    private Instant createdAt;
}
