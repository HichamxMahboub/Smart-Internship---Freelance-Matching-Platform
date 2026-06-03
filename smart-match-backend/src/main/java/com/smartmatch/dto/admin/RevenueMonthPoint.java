package com.smartmatch.dto.admin;

import java.math.BigDecimal;

public record RevenueMonthPoint(
        String month,
        String label,
        BigDecimal amount,
        long paymentCount
) {
}
