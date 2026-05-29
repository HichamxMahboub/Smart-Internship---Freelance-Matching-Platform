package com.smartmatch.dto.offer;

import com.smartmatch.model.enums.OfferType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.util.List;

public record OfferRequest(
        @NotBlank @Size(max = 180) String title,
        @NotBlank @Size(max = 5000) String description,
        @NotNull OfferType type,
        @Size(max = 120) String location,
        @Size(max = 120) String duration,
        List<@Size(max = 80) String> requiredSkills
) {
}
