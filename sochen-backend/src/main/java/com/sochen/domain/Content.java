package com.sochen.domain;

import com.sochen.domain.enums.ContentCategory;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;

@Entity
@Table(name = "content")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Content {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String title;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ContentCategory category;

    @Column(nullable = false)
    private String topic;

    @Column(nullable = false, length = 1024)
    private String thumbnail;

    @Column(nullable = false)
    private String duration;

    @Column(name = "subscriber_only", nullable = false)
    private boolean subscriberOnly;

    @Column(name = "upload_date", nullable = false)
    private LocalDate uploadDate;

    @Column(nullable = false)
    private Long views;

    @Column(nullable = false)
    private String creator;

    @Column(name = "creator_id", nullable = false)
    private Long creatorId;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String description;

    @Column(name = "media_url", length = 1024)
    private String mediaUrl;

    @Column(name = "simulation_likes", nullable = false)
    private long simulationLikes;
}
