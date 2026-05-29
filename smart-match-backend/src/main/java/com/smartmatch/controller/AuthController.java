package com.smartmatch.controller;

import com.smartmatch.dto.AuthResponse;
import com.smartmatch.dto.SyncUserRequest;
import com.smartmatch.dto.UserResponse;
import com.smartmatch.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {
    private final AuthService authService;

    @PostMapping("/sync-user")
    public ResponseEntity<AuthResponse> syncUser(@RequestHeader(HttpHeaders.AUTHORIZATION) String authorizationHeader,
                                                 @Valid @RequestBody SyncUserRequest request) {
        return ResponseEntity.ok(authService.syncUser(authorizationHeader, request));
    }

    @GetMapping("/me")
    public ResponseEntity<UserResponse> me() {
        return ResponseEntity.ok(authService.getCurrentUser());
    }
}
