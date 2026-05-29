package com.smartmatch.service;

import com.smartmatch.dto.notification.NotificationResponse;
import com.smartmatch.exception.ForbiddenException;
import com.smartmatch.exception.NotFoundException;
import com.smartmatch.model.Notification;
import com.smartmatch.model.User;
import com.smartmatch.repository.NotificationRepository;
import com.smartmatch.util.SecurityUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class NotificationService {
    private final NotificationRepository notificationRepository;

    public List<NotificationResponse> getCurrentUserNotifications() {
        User user = SecurityUtils.currentUser();
        return notificationRepository.findByUserIdOrderByCreatedAtDesc(user.getId()).stream()
                .map(this::toResponse)
                .toList();
    }

    public NotificationResponse markAsRead(String id) {
        User user = SecurityUtils.currentUser();
        Notification notification = notificationRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Notification not found with id: " + id));
        if (!notification.getUserId().equals(user.getId())) {
            throw new ForbiddenException("You can only update your own notifications");
        }
        notification.setRead(true);
        return toResponse(notificationRepository.save(notification));
    }

    public List<NotificationResponse> markAllAsRead() {
        User user = SecurityUtils.currentUser();
        List<Notification> notifications = notificationRepository.findByUserIdAndReadFalse(user.getId());
        notifications.forEach(notification -> notification.setRead(true));
        notificationRepository.saveAll(notifications);
        return getCurrentUserNotifications();
    }

    public NotificationResponse toResponse(Notification notification) {
        return new NotificationResponse(
                notification.getId(),
                notification.getUserId(),
                notification.getTitle(),
                notification.getMessage(),
                notification.getType(),
                notification.isRead(),
                notification.getCreatedAt()
        );
    }
}
