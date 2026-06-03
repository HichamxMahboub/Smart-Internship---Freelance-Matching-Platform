package com.smartmatch.controller;

import com.smartmatch.dto.admin.AdminUserDetailResponse;
import com.smartmatch.dto.admin.AdminUserOverviewResponse;
import com.smartmatch.dto.user.UserResponse;
import com.smartmatch.dto.user.UserStatusUpdateRequest;
import com.smartmatch.service.AdminUserDetailService;
import com.smartmatch.service.UserService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/admin/users")
@RequiredArgsConstructor
@Validated
@PreAuthorize("hasRole('ADMIN')")
public class AdminUserController {
    private final UserService userService;
    private final AdminUserDetailService adminUserDetailService;

    @GetMapping
    public ResponseEntity<List<UserResponse>> getAllUsers() {
        return ResponseEntity.ok(userService.getAllUsers());
    }

    @GetMapping("/page")
    public ResponseEntity<Page<UserResponse>> getUsersPage(@RequestParam(defaultValue = "0") @Min(0) int page,
                                                           @RequestParam(defaultValue = "20") @Min(1) @Max(100) int size) {
        return ResponseEntity.ok(userService.getUsersPage(page, size));
    }

    @GetMapping("/overview")
    public ResponseEntity<List<AdminUserOverviewResponse>> getOverview() {
        return ResponseEntity.ok(adminUserDetailService.getOverview());
    }

    @GetMapping("/{id}")
    public ResponseEntity<AdminUserDetailResponse> getUserDetail(@PathVariable String id) {
        return ResponseEntity.ok(adminUserDetailService.getDetail(id));
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<UserResponse> updateUserStatus(@PathVariable String id,
                                                         @Valid @RequestBody UserStatusUpdateRequest request) {
        return ResponseEntity.ok(userService.updateUserStatus(id, request));
    }

    @PostMapping("/{id}/sync-verification")
    public ResponseEntity<UserResponse> syncVerification(@PathVariable String id) {
        return ResponseEntity.ok(userService.syncVerificationFromFirebase(id));
    }
}
