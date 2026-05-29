package com.smartmatch.dto;

public record AuthResponse(
        UserResponse user,
        boolean created
) {
}
