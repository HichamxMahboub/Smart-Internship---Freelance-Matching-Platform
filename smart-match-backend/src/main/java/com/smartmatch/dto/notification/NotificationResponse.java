package com.smartmatch.dto.notification;

import com.smartmatch.model.enums.NotificationType;

import java.time.Instant;

public record NotificationResponse(
        String id,
        String userId,
        String title,
        String message,
        NotificationType type,
        boolean read,
        Instant createdAt
) {
}
