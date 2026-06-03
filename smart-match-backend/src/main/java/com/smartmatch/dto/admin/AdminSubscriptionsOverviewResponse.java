package com.smartmatch.dto.admin;

import java.util.List;

public record AdminSubscriptionsOverviewResponse(
        SubscriptionRevenueSummary revenue,
        List<AdminSubscriptionItemResponse> subscriptions
) {
}
