package com.smartmatch.dto.admin;

import com.smartmatch.model.enums.NotificationType;
import com.smartmatch.model.enums.Role;

import java.time.Instant;

public record AdminNotificationItemResponse(
        String id,
        String userId,
        String recipientName,
        String recipientEmail,
        Role recipientRole,
        String title,
        String message,
        NotificationType type,
        boolean read,
        Instant createdAt
) {
}
