package com.sochen.dto.response;

import com.fasterxml.jackson.annotation.JsonInclude;

import java.util.List;

@JsonInclude(JsonInclude.Include.NON_NULL)
public record ContentDetailDTO(
        Long id,
        String title,
        String category,
        String thumbnail,
        String duration,
        boolean subscriberOnly,
        String uploadDate,
        Long views,
        String creator,
        Long creatorId,
        String description,
        String mediaUrl,
        List<ContentModuleDTO> modules,
        List<String> topics,
        String creatorAvatarUrl,
        Long likeCount
) {
}
