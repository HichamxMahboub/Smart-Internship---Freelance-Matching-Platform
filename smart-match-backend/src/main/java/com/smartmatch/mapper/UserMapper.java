package com.smartmatch.mapper;

import com.smartmatch.dto.UserResponse;
import com.smartmatch.model.User;
import org.springframework.stereotype.Component;

@Component
public class UserMapper {
    public UserResponse toResponse(User user) {
        return new UserResponse(
                user.getId(),
                user.getFirebaseUid(),
                user.getFullName(),
                user.getEmail(),
                user.getRole(),
                user.getPlan(),
                user.isActive(),
                user.isEmailVerified(),
                user.getCreatedAt(),
                user.getUpdatedAt()
        );
    }
}
