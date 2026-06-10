package com.smartmatch.dto.payment;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

import java.math.BigDecimal;

/** Recruiter pays a candidate for a freelance mission tied to an application. */
public record FreelancePaymentRequest(
        @NotBlank String applicationId,
        @NotNull @Positive BigDecimal amount,
        String currency,
        String note
) {
}
