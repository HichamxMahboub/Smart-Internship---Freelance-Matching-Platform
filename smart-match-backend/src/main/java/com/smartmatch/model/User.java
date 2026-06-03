package com.smartmatch.model;

import com.smartmatch.model.enums.Plan;
import com.smartmatch.model.enums.Role;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "users")
public class User {
    @Id
    private String id;

    @Indexed(unique = true)
    private String firebaseUid;

    private String fullName;

    @Indexed(unique = true)
    private String email;

    @Indexed
    private Role role;
    private Plan plan;
    @Indexed
    private boolean active;
    private boolean emailVerified;

    private String fcmToken;

    @CreatedDate
    private Instant createdAt;

    @LastModifiedDate
    private Instant updatedAt;
}
