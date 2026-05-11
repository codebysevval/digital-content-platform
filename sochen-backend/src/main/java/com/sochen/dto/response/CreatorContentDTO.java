package com.sochen.dto.response;

import com.fasterxml.jackson.annotation.JsonFormat;

import java.time.LocalDate;

public record CreatorContentDTO(
        Long id,
        String title,
        String description,
        String thumbnail,
        String duration,
        boolean subscriberOnly,
        Long views,
        @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd")
        LocalDate uploadDate,
        String earnings,
        String topic,
        String category,
        Long likeCount
) {
}
