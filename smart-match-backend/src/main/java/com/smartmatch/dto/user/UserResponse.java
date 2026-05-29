package com.smartmatch.dto.user;

import com.smartmatch.model.enums.Plan;
import com.smartmatch.model.enums.Role;

import java.time.Instant;

public record UserResponse(
        String id,
        String fullName,
        String email,
        Role role,
        Plan plan,
        boolean active,
        boolean emailVerified,
        Instant createdAt,
        Instant updatedAt
) {
}
