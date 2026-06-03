package com.smartmatch.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.mongodb.core.index.CompoundIndex;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "conversations")
@CompoundIndex(name = "offer_participants_unique", def = "{'offerId': 1, 'candidateId': 1, 'recruiterId': 1}", unique = true)
public class Conversation {
    @Id
    private String id;

    @Indexed
    private String candidateId;

    @Indexed
    private String recruiterId;

    @Indexed
    private String offerId;

    private String lastMessage;
    @Indexed
    private Instant lastMessageAt;

    @Builder.Default
    private int candidateUnread = 0;

    @Builder.Default
    private int recruiterUnread = 0;

    @CreatedDate
    private Instant createdAt;

    @LastModifiedDate
    private Instant updatedAt;
}
