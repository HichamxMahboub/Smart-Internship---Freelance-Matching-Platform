package com.smartmatch.model;

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
import java.util.ArrayList;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "candidate_profiles")
public class CandidateProfile {
    @Id
    private String id;

    @Indexed(unique = true)
    private String userId;

    private String photoUrl;
    private String headline;
    private String bio;
    private String educationLevel;
    private String fieldOfStudy;
    private String location;
    private String cvUrl;

    @Builder.Default
    private List<String> skills = new ArrayList<>();

    @Builder.Default
    private List<SkillLevel> skillLevels = new ArrayList<>();

    @Builder.Default
    private List<String> languages = new ArrayList<>();

    @Builder.Default
    private List<String> preferences = new ArrayList<>();

    @Builder.Default
    private List<Project> projects = new ArrayList<>();

    @Builder.Default
    private List<Experience> experiences = new ArrayList<>();

    @Builder.Default
    private List<Education> educations = new ArrayList<>();

    private SocialLinks socials;

    @CreatedDate
    private Instant createdAt;

    @LastModifiedDate
    private Instant updatedAt;
}
