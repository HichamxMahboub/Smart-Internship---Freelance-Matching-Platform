package com.smartmatch.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/** Work / internship experience embedded in a candidate profile. */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Experience {
    private String role;
    private String org;
    private String start;
    private String end;
    private boolean current;
    private String description;
}
