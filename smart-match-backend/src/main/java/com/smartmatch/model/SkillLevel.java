package com.smartmatch.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/** A single skill with an AI-inferred proficiency level on a 0-100 scale. */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SkillLevel {
    private String name;
    private Integer level;
}
