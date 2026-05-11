package com.sochen.dto.response;

import com.sochen.domain.enums.ContentCategory;

public record ContentTypeOptionDTO(
        ContentCategory id,
        String label
) {
}
