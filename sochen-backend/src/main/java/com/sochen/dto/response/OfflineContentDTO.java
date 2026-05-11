package com.sochen.dto.response;

import com.sochen.domain.enums.ContentCategory;

public record OfflineContentDTO(
        Long id,
        String title,
        ContentCategory category,
        String thumbnail,
        String size,
        String downloadDate,
        String duration,
        Long views,
        boolean subscriberOnly,
        String creator
) {
}
