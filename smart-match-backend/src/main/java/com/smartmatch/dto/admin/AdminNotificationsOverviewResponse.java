package com.smartmatch.dto.admin;

import java.util.List;

public record AdminNotificationsOverviewResponse(
        NotificationInboxSummary summary,
        List<AdminNotificationItemResponse> notifications
) {
}
