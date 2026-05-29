package com.smartmatch.dto;

import com.smartmatch.model.enums.Role;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record SyncUserRequest(
        @NotBlank @Size(max = 120) String fullName,
        @NotNull Role role
) {
}
