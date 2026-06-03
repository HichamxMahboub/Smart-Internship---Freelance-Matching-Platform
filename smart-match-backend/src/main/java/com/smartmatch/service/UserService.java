package com.smartmatch.service;

import com.smartmatch.dto.user.FcmTokenRequest;
import com.smartmatch.dto.user.UserResponse;
import com.smartmatch.dto.user.UserStatusUpdateRequest;
import com.smartmatch.dto.user.UserUpdateRequest;
import com.smartmatch.exception.NotFoundException;
import com.smartmatch.model.User;
import com.smartmatch.repository.UserRepository;
import com.smartmatch.util.SecurityUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

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

    public UserResponse updateFcmToken(FcmTokenRequest request) {
        User user = SecurityUtils.currentUser();
        user.setFcmToken(request.fcmToken());
        return toResponse(userRepository.save(user));
    }

    public List<UserResponse> getAllUsers() {
        return userRepository.findAll().stream()
                .filter(user -> user.getEmail() != null && !user.getEmail().isBlank())
                .collect(Collectors.toMap(
                        user -> user.getEmail().trim().toLowerCase(),
                        user -> user,
                        (first, second) -> preferUser(first, second)))
                .values().stream()
                .sorted(Comparator.comparing(User::getCreatedAt, Comparator.nullsLast(Comparator.reverseOrder())))
                .map(this::toResponse)
                .toList();
    }

    private User preferUser(User first, User second) {
        boolean firstReal = first.getFirebaseUid() != null && !first.getFirebaseUid().startsWith("seed-");
        boolean secondReal = second.getFirebaseUid() != null && !second.getFirebaseUid().startsWith("seed-");
        if (firstReal != secondReal) {
            return firstReal ? first : second;
        }
        return first;
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
