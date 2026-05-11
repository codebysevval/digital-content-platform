package com.sochen.dto.response;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.sochen.domain.enums.ContentCategory;

import java.time.LocalDate;

public record LikedContentDTO(
        Long id,
        String title,
        ContentCategory category,
        String thumbnail,
        String duration,
        boolean subscriberOnly,
        Long views,
        String creator,
        @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd")
        LocalDate uploadDate
) {
}
