package com.smartmatch.dto.admin;

import java.math.BigDecimal;
import java.util.List;

public record SubscriptionRevenueSummary(
        BigDecimal totalRevenue,
        BigDecimal revenueThisMonth,
        BigDecimal estimatedMrr,
        String currency,
        long activeSubscriptions,
        long premiumUsers,
        long totalPayments,
        List<RevenueMonthPoint> byMonth
) {
}
