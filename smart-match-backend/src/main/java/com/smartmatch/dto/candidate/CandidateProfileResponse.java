package com.smartmatch.dto.candidate;

import com.smartmatch.model.Education;
import com.smartmatch.model.Experience;
import com.smartmatch.model.Project;
import com.smartmatch.model.SkillLevel;
import com.smartmatch.model.SocialLinks;

import java.time.Instant;
import java.util.List;

public record CandidateProfileResponse(
        String id,
        String userId,
        String photoUrl,
        String headline,
        String bio,
        String educationLevel,
        String fieldOfStudy,
        String location,
        String cvUrl,
        List<String> skills,
        List<SkillLevel> skillLevels,
        List<String> languages,
        List<String> preferences,
        List<Project> projects,
        List<Experience> experiences,
        List<Education> educations,
        SocialLinks socials,
        Instant createdAt,
        Instant updatedAt
) {
}
