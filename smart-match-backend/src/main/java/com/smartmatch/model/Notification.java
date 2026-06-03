package com.smartmatch.model;

import com.smartmatch.model.enums.NotificationType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.CompoundIndex;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "notifications")
@CompoundIndex(name = "user_read_created_idx", def = "{'userId': 1, 'read': 1, 'createdAt': -1}")
public class Notification {
    @Id
    private String id;

    @Indexed
    private String userId;

    private String title;
    private String message;
    private NotificationType type;
    private boolean read;

    @CreatedDate
    @Indexed
    private Instant createdAt;
}
