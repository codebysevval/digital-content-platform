package com.sochen.dto.response;

public record NotificationDTO(
        Long contentId,
        String creatorName,
        String creatorInitials,
        String contentTitle,
        String uploadedAt,
        String creatorAvatarUrl
) {
}
