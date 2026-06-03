package com.smartmatch.controller;

import com.smartmatch.dto.admin.AdminDashboardResponse;
import com.smartmatch.dto.admin.AdminLogResponse;
import com.smartmatch.dto.admin.AdminNotificationsOverviewResponse;
import com.smartmatch.dto.admin.AdminSubscriptionsOverviewResponse;
import com.smartmatch.service.AdminDashboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminDashboardController {
    private final AdminDashboardService adminDashboardService;

    @GetMapping("/dashboard")
    public ResponseEntity<AdminDashboardResponse> getDashboard() {
        return ResponseEntity.ok(adminDashboardService.getDashboard());
    }

    @GetMapping("/subscriptions")
    public ResponseEntity<AdminSubscriptionsOverviewResponse> getSubscriptions() {
        return ResponseEntity.ok(adminDashboardService.getSubscriptionsOverview());
    }

    @GetMapping("/notifications")
    public ResponseEntity<AdminNotificationsOverviewResponse> getNotifications() {
        return ResponseEntity.ok(adminDashboardService.getNotificationsOverview());
    }

    @GetMapping("/logs")
    public ResponseEntity<List<AdminLogResponse>> getLogs() {
        return ResponseEntity.ok(adminDashboardService.getAdminLogs());
    }
}
