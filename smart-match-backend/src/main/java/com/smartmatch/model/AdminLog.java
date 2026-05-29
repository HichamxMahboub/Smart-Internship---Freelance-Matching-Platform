package com.smartmatch.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "admin_logs")
public class AdminLog {
    @Id
    private String id;

    @Indexed
    private String adminId;

    private String action;
    private String targetType;
    private String targetId;
    private String description;

    @CreatedDate
    private Instant createdAt;
}
