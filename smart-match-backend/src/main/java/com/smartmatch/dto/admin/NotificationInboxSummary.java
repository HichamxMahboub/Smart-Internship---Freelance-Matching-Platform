package com.smartmatch.dto.admin;

public record NotificationInboxSummary(
        long total,
        long unread,
        long mineUnread,
        long applicationCount,
        long offerCount,
        long subscriptionCount,
        long aiCount,
        long adminCount
) {
}
