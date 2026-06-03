package com.smartmatch.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/** Education entry embedded in a candidate profile. */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Education {
    private String school;
    private String degree;
    private String field;
    private String start;
    private String end;
}
