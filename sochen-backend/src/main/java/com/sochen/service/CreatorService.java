package com.sochen.service;

import com.sochen.domain.Content;
import com.sochen.domain.Creator;
import com.sochen.domain.User;
import com.sochen.domain.UserFollow;
import com.sochen.domain.enums.UserRole;
import com.sochen.util.DisplayFormatter;
import com.sochen.domain.UserNotification;
import com.sochen.dto.response.CreatorContentDTO;
import com.sochen.dto.response.CreatorDTO;
import com.sochen.dto.response.CreatorSearchResultDTO;
import com.sochen.dto.response.FollowToggleResponse;
import com.sochen.dto.response.FollowedCreatorDTO;
import com.sochen.dto.response.NotificationDTO;
import com.sochen.dto.response.NotificationToggleResponse;
import com.sochen.exception.BadRequestException;
import com.sochen.exception.NotFoundException;
import com.sochen.mapper.ContentMapper;
import com.sochen.mapper.CreatorMapper;
import com.sochen.repository.ContentRepository;
import com.sochen.repository.CreatorRepository;
import com.sochen.repository.UserFollowRepository;
import com.sochen.repository.UserNotificationRepository;
import com.sochen.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.Locale;
import java.util.Optional;

@Service
public class CreatorService {

    private final CreatorRepository creatorRepository;
    private final ContentRepository contentRepository;
    private final UserFollowRepository userFollowRepository;
    private final UserNotificationRepository userNotificationRepository;
    private final UserRepository userRepository;
    private final CreatorMapper creatorMapper;
    private final ContentMapper contentMapper;

    public CreatorService(CreatorRepository creatorRepository,
                          ContentRepository contentRepository,
                          UserFollowRepository userFollowRepository,
                          UserNotificationRepository userNotificationRepository,
                          UserRepository userRepository,
                          CreatorMapper creatorMapper,
                          ContentMapper contentMapper) {
        this.creatorRepository = creatorRepository;
        this.contentRepository = contentRepository;
        this.userFollowRepository = userFollowRepository;
        this.userNotificationRepository = userNotificationRepository;
        this.userRepository = userRepository;
        this.creatorMapper = creatorMapper;
        this.contentMapper = contentMapper;
    }

    @Transactional
    public CreatorDTO getById(Long id) {
        Creator creator = creatorRepository.findById(id).orElseGet(() -> {
            User user = userRepository.findById(id)
                    .orElseThrow(() -> new NotFoundException("İçerik üreticisi bulunamadı"));
            if (user.getRole() != UserRole.ADMIN && user.getRole() != UserRole.CREATOR) {
                throw new NotFoundException("İçerik üreticisi bulunamadı");
            }
            return creatorRepository.save(Creator.builder()
                    .id(id)
                    .name(user.getName())
                    .avatar(DisplayFormatter.avatarInitials(user.getName()))
                    .type("İçerik Üreticisi")
                    .bio("")
                    .followers(0L)
                    .totalContent(0)
                    .totalViews(0L)
                    .build());
        });
        long totalViews = contentRepository.sumViewsByCreatorId(id);
        long contentCount = contentRepository.countByCreatorId(id);
        // Prefer User.avatarUrl over cached Creator.avatar initials so the
        // profile page always shows the uploaded photo when one exists.
        String avatar = userRepository.findById(id)
                .map(User::getAvatarUrl)
                .filter(url -> url != null && !url.isBlank())
                .orElse(creator.getAvatar());
        CreatorDTO base = creatorMapper.toDto(creator);
        return new CreatorDTO(base.id(), base.name(), avatar, base.type(), base.bio(), base.followers(), (int) contentCount, totalViews);
    }

    @Transactional(readOnly = true)
    public List<CreatorContentDTO> listCreatorContent(Long creatorId) {
        if (!creatorRepository.existsById(creatorId)) {
            throw new NotFoundException("İçerik üreticisi bulunamadı");
        }
        return contentRepository.findAllByCreatorIdOrderByUploadDateDesc(creatorId).stream()
                .map(contentMapper::toCreatorContent)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<FollowedCreatorDTO> listFollowed(Long userId) {
        List<UserFollow> follows = userFollowRepository.findAllByUserIdOrderByCreatedAtDesc(userId);
        if (follows.isEmpty()) return List.of();
        List<Long> creatorIds = follows.stream().map(UserFollow::getCreatorId).toList();
        List<Creator> creators = creatorRepository.findAllById(creatorIds);
        return follows.stream()
                .map(f -> creators.stream()
                        .filter(c -> c.getId().equals(f.getCreatorId()))
                        .findFirst()
                        .orElse(null))
                .filter(java.util.Objects::nonNull)
                .map(creatorMapper::toFollowedDto)
                .toList();
    }

    @Transactional
    public FollowToggleResponse toggleFollow(Long userId, Long creatorId) {
        if (userId.equals(creatorId)) {
            throw new BadRequestException("Kendinizi takip edemezsiniz");
        }
        Creator creator = creatorRepository.findById(creatorId)
                .orElseThrow(() -> new NotFoundException("İçerik üreticisi bulunamadı"));
        Optional<UserFollow> existing = userFollowRepository.findByUserIdAndCreatorId(userId, creatorId);
        if (existing.isPresent()) {
            userFollowRepository.delete(existing.get());
            creator.setFollowers(Math.max(0, creator.getFollowers() - 1));
            creatorRepository.save(creator);
            return new FollowToggleResponse(false, creator.getFollowers());
        }
        userFollowRepository.save(UserFollow.builder()
                .userId(userId)
                .creatorId(creatorId)
                .createdAt(OffsetDateTime.now())
                .build());
        creator.setFollowers(creator.getFollowers() + 1);
        creatorRepository.save(creator);
        return new FollowToggleResponse(true, creator.getFollowers());
    }

    @Transactional
    public NotificationToggleResponse toggleNotifications(Long userId, Long creatorId) {
        if (!creatorRepository.existsById(creatorId)) {
            throw new NotFoundException("İçerik üreticisi bulunamadı");
        }
        UserNotification notif = userNotificationRepository
                .findByUserIdAndCreatorId(userId, creatorId)
                .orElseGet(() -> UserNotification.builder()
                        .userId(userId)
                        .creatorId(creatorId)
                        .enabled(false)
                        .build());
        notif.setEnabled(!notif.isEnabled());
        userNotificationRepository.save(notif);
        return new NotificationToggleResponse(notif.isEnabled());
    }

    @Transactional(readOnly = true)
    public List<NotificationDTO> getNotifications(Long userId) {
        List<Long> followedCreatorIds = userFollowRepository
                .findAllByUserIdOrderByCreatedAtDesc(userId)
                .stream()
                .map(UserFollow::getCreatorId)
                .toList();
        if (followedCreatorIds.isEmpty()) {
            return List.of();
        }
        java.util.Map<Long, String> avatarMap = userRepository.findAllById(followedCreatorIds).stream()
                .collect(java.util.stream.Collectors.toMap(User::getId,
                        u -> u.getAvatarUrl() != null ? u.getAvatarUrl() : ""));
        LocalDate cutoff = LocalDate.now().minusDays(30);
        return contentRepository.findAllByCreatorIdInOrderByUploadDateDesc(followedCreatorIds)
                .stream()
                .filter(c -> !c.getUploadDate().isBefore(cutoff))
                .limit(20)
                .map(c -> new NotificationDTO(
                        c.getId(),
                        c.getCreator(),
                        com.sochen.util.DisplayFormatter.avatarInitials(c.getCreator()),
                        c.getTitle(),
                        com.sochen.util.DisplayFormatter.formatDisplayDate(c.getUploadDate()),
                        avatarMap.getOrDefault(c.getCreatorId(), "")
                ))
                .toList();
    }

    @Transactional(readOnly = true)
    public List<CreatorSearchResultDTO> searchCreators(String query) {
        String term = (query == null || query.isBlank()) ? null : query.toLowerCase(Locale.ROOT);
        java.util.Map<Long, String> avatarMap = userRepository.findAll().stream()
                .collect(java.util.stream.Collectors.toMap(User::getId,
                        u -> u.getAvatarUrl() != null ? u.getAvatarUrl() : ""));
        return creatorRepository.findAll().stream()
                .filter(c -> term == null || c.getName().toLowerCase(Locale.ROOT).contains(term))
                .map(c -> new CreatorSearchResultDTO(
                        c.getId(),
                        c.getName(),
                        c.getAvatar(),
                        c.getType(),
                        c.getFollowers(),
                        avatarMap.getOrDefault(c.getId(), "")))
                .toList();
    }

    @Transactional
    public void updateCreatorProfile(Long userId, String bio, String type) {
        Creator creator = creatorRepository.findById(userId)
                .orElseThrow(() -> new NotFoundException("Üretici profili bulunamadı"));
        if (bio != null) creator.setBio(bio);
        if (type != null && !type.isBlank()) creator.setType(type);
        creatorRepository.save(creator);
    }
}
