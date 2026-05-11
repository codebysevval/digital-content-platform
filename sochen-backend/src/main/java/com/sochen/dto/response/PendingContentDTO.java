package com.sochen.dto.response;

public record PendingContentDTO(
        Long id,
        String title,
        String creator,
        String type,
        String uploadDate,
        String thumbnail,
        String mediaUrl,
        String category,
        boolean subscriberOnly
) {
}
