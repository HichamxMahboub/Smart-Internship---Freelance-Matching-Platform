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

    @Builder.Default
    private List<SkillLevel> skillLevels = new ArrayList<>();

    /** AI-inferred role title (e.g. "React Frontend Engineer", "Data Analyst"). */
    private String profileType;
    /** Top 2-4 technologies that define the candidate. */
    private String primaryStack;
    /** Seniority bucket: Student | Intern | Junior | Mid | Senior | Lead. */
    private String seniority;

    private String recommendation;
    private String conclusion;
    private String details;
    /** Internal label for how the result was produced. Hidden in UI. */
    private String analysisSource;

    @CreatedDate
    private Instant createdAt;
}
