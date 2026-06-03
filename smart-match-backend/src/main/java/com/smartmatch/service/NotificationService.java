package com.smartmatch.service;

import com.smartmatch.dto.notification.NotificationResponse;
import com.smartmatch.exception.ForbiddenException;
import com.smartmatch.exception.NotFoundException;
import com.smartmatch.model.Notification;
import com.smartmatch.model.User;
import com.smartmatch.model.enums.NotificationType;
import com.smartmatch.repository.NotificationRepository;
import com.smartmatch.repository.UserRepository;
import com.smartmatch.util.SecurityUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class NotificationService {
    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;
    private final SimpMessagingTemplate messagingTemplate;
    private final FcmService fcmService;

    /**
     * Persists a notification, pushes it live over STOMP to the recipient's
     * {@code /user/queue/notifications} destination, and sends an FCM push as fallback.
     */
    public NotificationResponse create(String userId, String title, String message, NotificationType type) {
        Notification notification = notificationRepository.save(Notification.builder()
                .userId(userId)
                .title(title)
                .message(message)
                .type(type)
                .read(false)
                .build());
        NotificationResponse response = toResponse(notification);
        messagingTemplate.convertAndSendToUser(userId, "/queue/notifications", response);
        userRepository.findById(userId)
                .ifPresent(user -> fcmService.sendToToken(user.getFcmToken(), title, message));
        return response;
    }

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
