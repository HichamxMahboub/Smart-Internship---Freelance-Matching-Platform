package com.smartmatch.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/** Social / portfolio links embedded in a candidate profile. */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SocialLinks {
    private String github;
    private String linkedin;
    private String website;
    private String other;
}
