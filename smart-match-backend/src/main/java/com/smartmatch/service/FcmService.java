package com.smartmatch.service;

import com.google.firebase.FirebaseApp;
import com.google.firebase.messaging.FirebaseMessaging;
import com.google.firebase.messaging.Notification;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.util.logging.Level;
import java.util.logging.Logger;

/**
 * Best-effort Firebase Cloud Messaging sender. No-op when Firebase Admin is not
 * initialized (offline/local demo) or the recipient has no registered device token.
 */
@Service
public class FcmService {
    private static final Logger log = Logger.getLogger(FcmService.class.getName());

    public void sendToToken(String fcmToken, String title, String body) {
        if (!StringUtils.hasText(fcmToken) || FirebaseApp.getApps().isEmpty()) {
            return;
        }
        try {
            FirebaseMessaging.getInstance().send(
                    com.google.firebase.messaging.Message.builder()
                            .setToken(fcmToken)
                            .setNotification(Notification.builder()
                                    .setTitle(title)
                                    .setBody(body)
                                    .build())
                            .build());
        } catch (Exception exception) {
            log.log(Level.WARNING, "Failed to send FCM push: " + exception.getMessage());
        }
    }
}
