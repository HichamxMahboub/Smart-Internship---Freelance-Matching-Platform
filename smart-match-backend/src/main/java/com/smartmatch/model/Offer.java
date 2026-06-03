package com.smartmatch.model;

import com.smartmatch.model.enums.OfferStatus;
import com.smartmatch.model.enums.OfferType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.index.TextIndexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "offers")
public class Offer {
    @Id
    private String id;

    @Indexed
    private String companyId;

    @TextIndexed
    private String title;
    @TextIndexed
    private String description;
    @Indexed
    private OfferType type;
    @Indexed
    private String location;
    private String duration;

    @Builder.Default
    private List<String> requiredSkills = new ArrayList<>();

    @Indexed
    private OfferStatus status;
    private Instant publishedAt;
    private Instant archiveAt;

    @CreatedDate
    @Indexed
    private Instant createdAt;

    @LastModifiedDate
    private Instant updatedAt;
}
