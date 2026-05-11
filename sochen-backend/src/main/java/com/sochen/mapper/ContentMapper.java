package com.sochen.mapper;

import com.sochen.domain.Content;
import com.sochen.domain.ContentModule;
import com.sochen.domain.ContentTopic;
import com.sochen.dto.response.ContentDTO;
import com.sochen.dto.response.ContentDetailDTO;
import com.sochen.dto.response.ContentModuleDTO;
import com.sochen.dto.response.CreatorContentDTO;
import com.sochen.dto.response.LikedContentDTO;
import com.sochen.dto.response.RelatedContentDTO;
import com.sochen.util.DisplayFormatter;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class ContentMapper {

    public ContentDTO toSummary(Content c, String creatorAvatarUrl, Long likeCount) {
        return new ContentDTO(
                c.getId(),
                c.getTitle(),
                c.getCategory(),
                c.getTopic(),
                c.getThumbnail(),
                c.getDuration(),
                c.isSubscriberOnly(),
                c.getUploadDate(),
                c.getViews(),
                c.getCreator(),
                c.getCreatorId(),
                c.getDescription(),
                creatorAvatarUrl,
                likeCount
        );
    }

    public ContentDetailDTO toDetail(Content c, List<ContentModule> modules, List<ContentTopic> topics, String creatorAvatarUrl, Long likeCount) {
        List<ContentModuleDTO> moduleDtos = modules == null || modules.isEmpty()
                ? null
                : modules.stream()
                .map(m -> new ContentModuleDTO(m.getTitle(), m.getDuration()))
                .toList();
        List<String> topicLabels = topics == null || topics.isEmpty()
                ? null
                : topics.stream().map(ContentTopic::getLabel).toList();
        return new ContentDetailDTO(
                c.getId(),
                c.getTitle(),
                c.getCategory().toJson(),
                c.getThumbnail(),
                c.getDuration(),
                c.isSubscriberOnly(),
                DisplayFormatter.formatDisplayDate(c.getUploadDate()),
                c.getViews(),
                c.getCreator(),
                c.getCreatorId(),
                c.getDescription(),
                c.getMediaUrl(),
                moduleDtos,
                topicLabels,
                creatorAvatarUrl,
                likeCount
        );
    }

    public RelatedContentDTO toRelated(Content c) {
        return new RelatedContentDTO(c.getId(), c.getTitle(), c.getThumbnail(), c.getDuration());
    }

    public CreatorContentDTO toCreatorContent(Content c) {
        return new CreatorContentDTO(
                c.getId(),
                c.getTitle(),
                c.getDescription(),
                c.getThumbnail(),
                c.getDuration(),
                c.isSubscriberOnly(),
                c.getViews(),
                c.getUploadDate(),
                null,
                c.getTopic(),
                c.getCategory() != null ? c.getCategory().toJson() : null,
                null
        );
    }

    public LikedContentDTO toLiked(Content c) {
        return new LikedContentDTO(
                c.getId(),
                c.getTitle(),
                c.getCategory(),
                c.getThumbnail(),
                c.getDuration(),
                c.isSubscriberOnly(),
                c.getViews(),
                c.getCreator(),
                c.getUploadDate()
        );
    }
}
