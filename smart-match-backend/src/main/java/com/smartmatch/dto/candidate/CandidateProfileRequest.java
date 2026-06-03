package com.smartmatch.dto.candidate;

import com.smartmatch.model.Education;
import com.smartmatch.model.Experience;
import com.smartmatch.model.Project;
import com.smartmatch.model.SkillLevel;
import com.smartmatch.model.SocialLinks;
import jakarta.validation.constraints.Size;

import java.util.List;

public record CandidateProfileRequest(
        String photoUrl,
        @Size(max = 160) String headline,
        @Size(max = 2000) String bio,
        @Size(max = 120) String educationLevel,
        @Size(max = 120) String fieldOfStudy,
        @Size(max = 120) String location,
        String cvUrl,
        List<@Size(max = 80) String> skills,
        List<SkillLevel> skillLevels,
        List<@Size(max = 80) String> languages,
        List<@Size(max = 120) String> preferences,
        List<Project> projects,
        List<Experience> experiences,
        List<Education> educations,
        SocialLinks socials
) {
}
