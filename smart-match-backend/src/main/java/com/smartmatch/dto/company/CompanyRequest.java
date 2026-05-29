package com.smartmatch.dto.company;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record CompanyRequest(
        @NotBlank @Size(max = 160) String name,
        @Size(max = 120) String sector,
        @Size(max = 2000) String description,
        String logoUrl,
        String website
) {
}
