package com.smartmatch.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/** Portfolio project embedded in a candidate profile. */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Project {
    private String title;
    private String description;
    private String link;
    private String imageUrl;
}
