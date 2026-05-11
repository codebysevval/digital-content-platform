package com.sochen.dto.response;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.sochen.domain.enums.ContentCategory;

import java.time.LocalDate;

public record ContentDTO(
        Long id,
        String title,
        ContentCategory category,
        String topic,
        String thumbnail,
        String duration,
        boolean subscriberOnly,
        @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd")
        LocalDate uploadDate,
        Long views,
        String creator,
        Long creatorId,
        String description,
        String creatorAvatarUrl,
        Long likeCount
) {
}
