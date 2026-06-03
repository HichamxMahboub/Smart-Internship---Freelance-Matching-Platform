package com.smartmatch.controller;

import com.smartmatch.dto.user.FcmTokenRequest;
import com.smartmatch.dto.user.UserResponse;
import com.smartmatch.dto.user.UserStatusUpdateRequest;
import com.smartmatch.dto.user.UserUpdateRequest;
import com.smartmatch.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {
    private final UserService userService;

    @GetMapping("/me")
    public ResponseEntity<UserResponse> me() {
        return ResponseEntity.ok(userService.getCurrentUser());
    }

    @PutMapping("/me")
    public ResponseEntity<UserResponse> updateMe(@Valid @RequestBody UserUpdateRequest request) {
        return ResponseEntity.ok(userService.updateCurrentUser(request));
    }

    @PutMapping("/me/fcm-token")
    public ResponseEntity<UserResponse> updateFcmToken(@Valid @RequestBody FcmTokenRequest request) {
        return ResponseEntity.ok(userService.updateFcmToken(request));
    }

    @PostMapping("/me/refresh-verification")
    public ResponseEntity<UserResponse> refreshVerification() {
        return ResponseEntity.ok(userService.refreshCurrentVerification());
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<UserResponse> getUserById(@PathVariable String id) {
        return ResponseEntity.ok(userService.getUserById(id));
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<UserResponse> updateUserStatus(@PathVariable String id,
                                                         @Valid @RequestBody UserStatusUpdateRequest request) {
        return ResponseEntity.ok(userService.updateUserStatus(id, request));
    }
}
