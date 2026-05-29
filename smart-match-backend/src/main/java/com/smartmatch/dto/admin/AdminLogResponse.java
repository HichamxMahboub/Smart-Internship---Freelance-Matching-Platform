package com.smartmatch.dto.admin;

import java.time.Instant;

public record AdminLogResponse(
        String id,
        String adminId,
        String action,
        String targetType,
        String targetId,
        String description,
        Instant createdAt
) {
}
