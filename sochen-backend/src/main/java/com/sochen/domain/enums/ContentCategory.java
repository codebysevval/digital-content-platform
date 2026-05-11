package com.sochen.domain.enums;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;

public enum ContentCategory {
    COURSES("Video", "Video"),
    PODCASTS("Podcast", "Podcast"),
    MAGAZINES("Dergi", "Dergi"),
    NEWSPAPERS("Gazete", "Gazete"),
    EBOOKS("E-kitap", "E-kitap");

    private final String displayLabel;
    private final String moderationLabel;

    ContentCategory(String displayLabel, String moderationLabel) {
        this.displayLabel = displayLabel;
        this.moderationLabel = moderationLabel;
    }

    public String getDisplayLabel() {
        return displayLabel;
    }

    public String getModerationLabel() {
        return moderationLabel;
    }

    @JsonValue
    public String toJson() {
        return name().toLowerCase();
    }

    @JsonCreator
    public static ContentCategory fromJson(String value) {
        if (value == null) {
            return null;
        }
        return ContentCategory.valueOf(value.trim().toUpperCase());
    }
}
