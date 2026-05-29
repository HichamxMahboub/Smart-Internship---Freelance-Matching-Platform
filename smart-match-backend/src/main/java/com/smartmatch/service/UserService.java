package com.smartmatch.service;

import com.smartmatch.dto.user.UserResponse;
import com.smartmatch.dto.user.UserStatusUpdateRequest;
import com.smartmatch.dto.user.UserUpdateRequest;
import com.smartmatch.exception.NotFoundException;
import com.smartmatch.model.User;
import com.smartmatch.repository.UserRepository;
import com.smartmatch.util.SecurityUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class UserService {
    private final UserRepository userRepository;

    public UserResponse getCurrentUser() {
        return toResponse(SecurityUtils.currentUser());
    }

    public UserResponse updateCurrentUser(UserUpdateRequest request) {
        User user = SecurityUtils.currentUser();
        user.setFullName(request.fullName());
        return toResponse(userRepository.save(user));
    }

    public UserResponse getUserById(String id) {
        return userRepository.findById(id)
                .map(this::toResponse)
                .orElseThrow(() -> new NotFoundException("User not found with id: " + id));
    }

    public UserResponse updateUserStatus(String id, UserStatusUpdateRequest request) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("User not found with id: " + id));
        user.setActive(request.active());
        return toResponse(userRepository.save(user));
    }

    private UserResponse toResponse(User user) {
        return new UserResponse(
                user.getId(),
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
