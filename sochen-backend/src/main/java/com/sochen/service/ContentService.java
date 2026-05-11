package com.sochen.service;

import com.sochen.domain.Content;
import com.sochen.domain.ContentModule;
import com.sochen.domain.ContentTopic;
import com.sochen.domain.User;
import com.sochen.domain.UserLike;
import com.sochen.domain.enums.ContentCategory;
import com.sochen.dto.response.ContentDTO;
import com.sochen.dto.response.ContentDetailDTO;
import com.sochen.dto.response.ContentTypeOptionDTO;
import com.sochen.dto.response.LikeToggleResponse;
import com.sochen.dto.response.LikedContentDTO;
import com.sochen.dto.response.RelatedContentDTO;
import com.sochen.dto.response.TopicDTO;
import com.sochen.exception.NotFoundException;
import com.sochen.mapper.ContentMapper;
import com.sochen.repository.ContentModuleRepository;
import com.sochen.repository.ContentRepository;
import com.sochen.repository.ContentTopicRepository;
import com.sochen.repository.UserFollowRepository;
import com.sochen.repository.UserLikeRepository;
import com.sochen.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.time.temporal.ChronoUnit;
import java.util.Comparator;
import java.util.HashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class ContentService {

    private static final List<TopicDTO> TOPICS = List.of(
            new TopicDTO("all", "Tümü"),
            new TopicDTO("software", "Yazılım"),
            new TopicDTO("technology", "Teknoloji"),
            new TopicDTO("business", "Girişimcilik"),
            new TopicDTO("finance", "Finans"),
            new TopicDTO("economy", "Ekonomi"),
            new TopicDTO("design", "Tasarım"),
            new TopicDTO("science", "Bilim"),
            new TopicDTO("health", "Sağlık"),
            new TopicDTO("sports", "Spor"),
            new TopicDTO("history", "Tarih"),
            new TopicDTO("music", "Müzik"),
            new TopicDTO("art", "Sanat"),
            new TopicDTO("film", "Film & Dizi"),
            new TopicDTO("gaming", "Oyun"),
            new TopicDTO("lifestyle", "Yaşam Tarzı"),
            new TopicDTO("food", "Yemek"),
            new TopicDTO("politics", "Siyaset"),
            new TopicDTO("culture", "Kültür"),
            new TopicDTO("philosophy", "Felsefe"),
            new TopicDTO("literature", "Edebiyat"),
            new TopicDTO("education", "Eğitim")
    );

    private static final List<ContentTypeOptionDTO> CONTENT_TYPES = List.of(
            new ContentTypeOptionDTO(ContentCategory.COURSES, "Video"),
            new ContentTypeOptionDTO(ContentCategory.PODCASTS, "Podcast'ler"),
            new ContentTypeOptionDTO(ContentCategory.MAGAZINES, "Dergiler"),
            new ContentTypeOptionDTO(ContentCategory.NEWSPAPERS, "Gazeteler"),
            new ContentTypeOptionDTO(ContentCategory.EBOOKS, "E-Kitaplar")
    );

    private static final int TRENDING_LIMIT = 10;

    private final ContentRepository contentRepository;
    private final ContentModuleRepository moduleRepository;
    private final ContentTopicRepository topicRepository;
    private final UserLikeRepository userLikeRepository;
    private final UserFollowRepository userFollowRepository;
    private final UserRepository userRepository;
    private final ContentMapper contentMapper;

    public ContentService(ContentRepository contentRepository,
                          ContentModuleRepository moduleRepository,
                          ContentTopicRepository topicRepository,
                          UserLikeRepository userLikeRepository,
                          UserFollowRepository userFollowRepository,
                          UserRepository userRepository,
                          ContentMapper contentMapper) {
        this.contentRepository = contentRepository;
        this.moduleRepository = moduleRepository;
        this.topicRepository = topicRepository;
        this.userLikeRepository = userLikeRepository;
        this.userFollowRepository = userFollowRepository;
        this.userRepository = userRepository;
        this.contentMapper = contentMapper;
    }

    public List<TopicDTO> listTopics() {
        return TOPICS;
    }

    public List<ContentTypeOptionDTO> listContentTypes() {
        return CONTENT_TYPES;
    }

    @Transactional(readOnly = true)
    public List<ContentDTO> listAll() {
        List<Content> all = contentRepository.findAll().stream()
                .sorted(Comparator.comparing(Content::getUploadDate).reversed())
                .toList();
        Map<Long, String> avatarMap = buildAvatarMap(all);
        Map<Long, Long> likeMap = buildLikeMap();
        return all.stream()
                .map(c -> contentMapper.toSummary(c, avatarMap.get(c.getCreatorId()), likeMap.getOrDefault(c.getId(), 0L)))
                .toList();
    }

    @Transactional(readOnly = true)
    public ContentDetailDTO getById(Long id) {
        Content content = contentRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("İçerik bulunamadı"));
        List<ContentModule> modules = moduleRepository.findAllByContentIdOrderBySortOrderAsc(id);
        List<ContentTopic> topics = topicRepository.findAllByContentIdOrderBySortOrderAsc(id);
        String avatarUrl = userRepository.findById(content.getCreatorId())
                .map(User::getAvatarUrl).orElse(null);
        long likeCount = userLikeRepository.countByContentId(id);
        return contentMapper.toDetail(content, modules, topics, avatarUrl, likeCount);
    }

    @Transactional(readOnly = true)
    public List<RelatedContentDTO> getRelated(Long id) {
        Content content = contentRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("İçerik bulunamadı"));
        return contentRepository
                .findTop3ByCategoryAndIdNotOrderByViewsDesc(content.getCategory(), id)
                .stream()
                .map(contentMapper::toRelated)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<ContentDTO> search(String category,
                                   String topic,
                                   String searchQuery,
                                   boolean showSubscriberOnly,
                                   boolean showFreeContent,
                                   List<ContentCategory> selectedTypes,
                                   String sortBy) {

        Set<ContentCategory> typeFilter = (selectedTypes == null || selectedTypes.isEmpty())
                ? null
                : Set.copyOf(selectedTypes);

        ContentCategory categoryFilter = null;
        if (category != null && !category.isBlank() && !"all".equalsIgnoreCase(category)) {
            categoryFilter = ContentCategory.valueOf(category.toUpperCase(Locale.ROOT));
        }
        final ContentCategory categoryFilterFinal = categoryFilter;
        final String topicFilter = (topic == null || topic.isBlank() || "all".equalsIgnoreCase(topic))
                ? null
                : topic.toLowerCase(Locale.ROOT);
        final String searchTerm = (searchQuery == null || searchQuery.isBlank())
                ? null
                : searchQuery.toLowerCase(Locale.ROOT);

        List<Content> filtered = contentRepository.findAll().stream()
                .filter(c -> categoryFilterFinal == null || c.getCategory() == categoryFilterFinal)
                .filter(c -> typeFilter == null || typeFilter.contains(c.getCategory()))
                .filter(c -> topicFilter == null || topicFilter.equals(c.getTopic().toLowerCase(Locale.ROOT)))
                .filter(c -> searchTerm == null || c.getTitle().toLowerCase(Locale.ROOT).contains(searchTerm))
                .filter(c -> {
                    if (showFreeContent && showSubscriberOnly) return true;
                    if (showFreeContent) return !c.isSubscriberOnly();
                    if (showSubscriberOnly) return c.isSubscriberOnly();
                    return false;
                })
                .collect(Collectors.toList());

        Comparator<Content> comparator = switch (sortBy == null ? "newest" : sortBy.toLowerCase(Locale.ROOT)) {
            case "oldest" -> Comparator.comparing(Content::getUploadDate);
            case "popular" -> Comparator.comparing(Content::getViews).reversed();
            default -> Comparator.comparing(Content::getUploadDate).reversed();
        };
        filtered.sort(comparator);
        Map<Long, String> avatarMap = buildAvatarMap(filtered);
        Map<Long, Long> likeMap = buildLikeMap();
        return filtered.stream().map(c -> contentMapper.toSummary(c, avatarMap.get(c.getCreatorId()), likeMap.getOrDefault(c.getId(), 0L))).toList();
    }

    @Transactional
    public void recordView(Long contentId) {
        contentRepository.findById(contentId)
                .orElseThrow(() -> new NotFoundException("İçerik bulunamadı"));
        contentRepository.incrementViews(contentId);
    }

    @Transactional
    public LikeToggleResponse toggleLike(Long userId, Long contentId) {
        contentRepository.findById(contentId)
                .orElseThrow(() -> new NotFoundException("İçerik bulunamadı"));
        Optional<UserLike> existing = userLikeRepository.findByUserIdAndContentId(userId, contentId);
        if (existing.isPresent()) {
            userLikeRepository.delete(existing.get());
            return new LikeToggleResponse(false);
        }
        userLikeRepository.save(UserLike.builder()
                .userId(userId)
                .contentId(contentId)
                .createdAt(OffsetDateTime.now())
                .build());
        return new LikeToggleResponse(true);
    }

    @Transactional(readOnly = true)
    public List<LikedContentDTO> listLikedContent(Long userId) {
        List<UserLike> likes = userLikeRepository.findAllByUserIdOrderByCreatedAtDesc(userId);
        if (likes.isEmpty()) return List.of();
        List<Long> contentIds = likes.stream().map(UserLike::getContentId).toList();
        List<Content> contents = contentRepository.findAllById(contentIds);
        return likes.stream()
                .map(like -> contents.stream()
                        .filter(c -> c.getId().equals(like.getContentId()))
                        .findFirst()
                        .orElse(null))
                .filter(java.util.Objects::nonNull)
                .map(contentMapper::toLiked)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<ContentDTO> getTrending() {
        List<Content> all = contentRepository.findAll();
        Map<Long, Long> likeMap = buildLikeMap();
        Map<Long, String> avatarMap = buildAvatarMap(all);
        return rankedByScore(all, likeMap, avatarMap)
                .stream().limit(TRENDING_LIMIT).toList();
    }

    @Transactional(readOnly = true)
    public List<ContentDTO> getRecommended(String category) {
        List<Content> all = contentRepository.findAll();
        Map<Long, Long> likeMap = buildLikeMap();
        if (category == null || category.isBlank()) {
            Map<Long, String> avatarMap = buildAvatarMap(all);
            return rankedByScore(all, likeMap, avatarMap).stream().limit(TRENDING_LIMIT * 3L).toList();
        }
        ContentCategory cat;
        try {
            cat = ContentCategory.valueOf(category.toUpperCase(Locale.ROOT));
        } catch (IllegalArgumentException e) {
            Map<Long, String> avatarMap = buildAvatarMap(all);
            return rankedByScore(all, likeMap, avatarMap).stream().limit(TRENDING_LIMIT * 3L).toList();
        }
        List<Content> byCat = all.stream()
                .filter(c -> c.getCategory() == cat)
                .toList();
        Map<Long, String> avatarMap = buildAvatarMap(byCat.isEmpty() ? all : byCat);
        List<Content> pool = byCat.isEmpty() ? all : byCat;
        return rankedByScore(pool, likeMap, avatarMap).stream().limit(TRENDING_LIMIT * 3L).toList();
    }

    @Transactional(readOnly = true)
    public List<ContentDTO> getFollowingFeed(Long userId) {
        List<Long> creatorIds = userFollowRepository.findAllByUserIdOrderByCreatedAtDesc(userId)
                .stream().map(f -> f.getCreatorId()).toList();
        if (creatorIds.isEmpty()) return List.of();
        Map<Long, Long> likeMap = buildLikeMap();
        List<Content> items = contentRepository.findAllByCreatorIdInOrderByUploadDateDesc(creatorIds)
                .stream().limit(TRENDING_LIMIT * 2L).toList();
        Map<Long, String> avatarMap = buildAvatarMap(items);
        return items.stream().map(c -> contentMapper.toSummary(c, avatarMap.get(c.getCreatorId()), likeMap.getOrDefault(c.getId(), 0L))).toList();
    }

    private Map<Long, String> buildAvatarMap(List<Content> contents) {
        Set<Long> creatorIds = contents.stream()
                .map(Content::getCreatorId)
                .collect(Collectors.toSet());
        return userRepository.findAllById(creatorIds).stream()
                .collect(Collectors.toMap(User::getId, u -> u.getAvatarUrl() != null ? u.getAvatarUrl() : ""));
    }

    private Map<Long, Long> buildLikeMap() {
        Map<Long, Long> map = new HashMap<>();
        for (Object[] row : userLikeRepository.countGroupedByContent()) {
            map.put((Long) row[0], (Long) row[1]);
        }
        return map;
    }

    private List<ContentDTO> rankedByScore(List<Content> items, Map<Long, Long> likeMap, Map<Long, String> avatarMap) {
        LocalDate today = LocalDate.now();
        return items.stream()
                .sorted(Comparator.comparingDouble((Content c) -> {
                    long likes = likeMap.getOrDefault(c.getId(), 0L) + c.getSimulationLikes();
                    long hoursSince = Math.max(ChronoUnit.HOURS.between(
                            c.getUploadDate().atStartOfDay(),
                            today.atStartOfDay()), 1);
                    return (c.getViews() + likes * 5.0) / hoursSince;
                }).reversed())
                .map(c -> contentMapper.toSummary(c, avatarMap.get(c.getCreatorId()), likeMap.getOrDefault(c.getId(), 0L)))
                .toList();
    }
}
