package com.sochen.service;

import com.sochen.domain.Content;
import com.sochen.domain.PendingContent;
import com.sochen.domain.enums.ContentCategory;
import com.sochen.dto.request.ContentUpdateRequest;
import com.sochen.dto.request.NewContentRequest;
import com.sochen.dto.response.CreatedIdResponse;
import com.sochen.dto.response.CreatorContentDTO;
import com.sochen.dto.response.CreatorFollowerDTO;
import com.sochen.dto.response.CreatorStudioStatsDTO;
import com.sochen.dto.response.EarningsHistoryEntryDTO;
import com.sochen.dto.response.UploadResponse;
import com.sochen.exception.BadRequestException;
import com.sochen.exception.NotFoundException;
import com.sochen.repository.ContentRepository;
import com.sochen.repository.CreatorEarningRepository;
import com.sochen.repository.CreatorRepository;
import com.sochen.repository.PendingContentRepository;
import com.sochen.repository.UserFollowRepository;
import com.sochen.repository.UserLikeRepository;
import com.sochen.repository.UserRepository;
import com.sochen.security.CustomUserDetails;
import com.sochen.util.DisplayFormatter;
import org.apache.pdfbox.Loader;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.math.BigDecimal;
import java.nio.file.Path;
import java.time.LocalDate;
import java.time.YearMonth;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Locale;
import java.util.UUID;

@Service
public class CreatorStudioService {

    private static final DateTimeFormatter TR_MONTH_FMT =
            DateTimeFormatter.ofPattern("MMM yyyy", new Locale("tr", "TR"));

    private final PendingContentRepository pendingRepo;
    private final ContentRepository contentRepository;
    private final UserLikeRepository userLikeRepository;
    private final CreatorEarningRepository earningRepository;
    private final UserRepository userRepository;
    private final CreatorRepository creatorRepository;
    private final UserFollowRepository userFollowRepository;
    private final Path uploadRoot;

    public CreatorStudioService(PendingContentRepository pendingRepo,
                                ContentRepository contentRepository,
                                UserLikeRepository userLikeRepository,
                                CreatorEarningRepository earningRepository,
                                UserRepository userRepository,
                                CreatorRepository creatorRepository,
                                UserFollowRepository userFollowRepository,
                                Path uploadRoot) {
        this.pendingRepo = pendingRepo;
        this.contentRepository = contentRepository;
        this.userLikeRepository = userLikeRepository;
        this.earningRepository = earningRepository;
        this.userRepository = userRepository;
        this.creatorRepository = creatorRepository;
        this.userFollowRepository = userFollowRepository;
        this.uploadRoot = uploadRoot;
    }

    public CreatorStudioStatsDTO getStats(CustomUserDetails creator) {
        Long creatorId = creator.getId();
        long contentCount = contentRepository.countByCreatorId(creatorId);
        long totalViews = contentRepository.sumViewsByCreatorId(creatorId);
        long totalLikes = userLikeRepository.countLikesForCreator(creatorId);

        int engagementPct = totalViews > 0
                ? (int) Math.round((double) totalLikes / totalViews * 100)
                : 0;

        BigDecimal monthly = earningRepository.sumCurrentMonthByCreatorId(creatorId);
        BigDecimal total   = earningRepository.sumTotalByCreatorId(creatorId);

        return new CreatorStudioStatsDTO(
                (int) contentCount,
                DisplayFormatter.formatAbbreviatedCount(totalViews),
                DisplayFormatter.formatPercentageInt(engagementPct),
                DisplayFormatter.formatCurrencyDecimal(monthly),
                DisplayFormatter.formatCurrencyDecimal(total)
        );
    }

    public List<EarningsHistoryEntryDTO> getEarningsHistory(Long creatorId) {
        return earningRepository.findMonthlyEarnings(creatorId).stream()
                .map(row -> {
                    String monthKey = (String) row[0];
                    BigDecimal total = (BigDecimal) row[1];
                    String label = YearMonth.parse(monthKey).atDay(1).format(TR_MONTH_FMT);
                    return new EarningsHistoryEntryDTO(label, total);
                })
                .toList();
    }

    @Transactional
    public CreatedIdResponse publish(CustomUserDetails creator, NewContentRequest request) {
        ContentCategory category;
        try {
            category = ContentCategory.valueOf(request.category().trim().toUpperCase(Locale.ROOT));
        } catch (IllegalArgumentException ex) {
            throw new BadRequestException("Geçersiz kategori");
        }

        String thumbnail = (request.thumbnailUrl() != null && !request.thumbnailUrl().isBlank())
                ? request.thumbnailUrl()
                : "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800&fit=crop";

        PendingContent pending = PendingContent.builder()
                .title(request.title())
                .creator(displayName(creator))
                .creatorId(creator.getId())
                .category(category)
                .topic(request.topic())
                .duration(request.duration())
                .description(request.description())
                .subscriberOnly(Boolean.TRUE.equals(request.subscriberOnly()))
                .uploadDate(LocalDate.now())
                .thumbnail(thumbnail)
                .mediaUrl(request.mediaUrl())
                .thumbnailUploadUrl(request.thumbnailUrl())
                .attachmentUrls(request.attachmentUrls())
                .status("PENDING")
                .build();
        pending = pendingRepo.save(pending);
        return new CreatedIdResponse(pending.getId());
    }

    public List<CreatorContentDTO> getMyContent(Long creatorId) {
        java.util.Map<Long, BigDecimal> earningsMap = new java.util.HashMap<>();
        for (Object[] row : earningRepository.findEarningsGroupedByContent(creatorId)) {
            Long cid = ((Number) row[0]).longValue();
            BigDecimal amt = (BigDecimal) row[1];
            earningsMap.put(cid, amt);
        }
        List<com.sochen.domain.Content> contents =
                contentRepository.findAllByCreatorIdOrderByUploadDateDesc(creatorId);
        List<Long> contentIds = contents.stream().map(com.sochen.domain.Content::getId).toList();
        java.util.Map<Long, Long> likeMap = new java.util.HashMap<>();
        if (!contentIds.isEmpty()) {
            for (Object[] row : userLikeRepository.countGroupedByContentIdIn(contentIds)) {
                likeMap.put(((Number) row[0]).longValue(), ((Number) row[1]).longValue());
            }
        }
        return contents.stream()
                .map(c -> {
                    BigDecimal earned = earningsMap.getOrDefault(c.getId(), BigDecimal.ZERO);
                    return new CreatorContentDTO(
                            c.getId(),
                            c.getTitle(),
                            c.getDescription(),
                            c.getThumbnail(),
                            c.getDuration(),
                            c.isSubscriberOnly(),
                            c.getViews(),
                            c.getUploadDate(),
                            DisplayFormatter.formatCurrencyDecimal(earned),
                            c.getTopic(),
                            c.getCategory() != null ? c.getCategory().toJson() : null,
                            likeMap.getOrDefault(c.getId(), 0L));
                })
                .toList();
    }

    @Transactional
    public void deleteContent(Long creatorId, Long contentId) {
        Content content = contentRepository.findById(contentId)
                .orElseThrow(() -> new NotFoundException("İçerik bulunamadı"));
        if (!content.getCreatorId().equals(creatorId)) {
            throw new BadRequestException("Bu içeriği silme yetkiniz yok");
        }
        contentRepository.delete(content);
        creatorRepository.findById(creatorId).ifPresent(creator -> {
            creator.setTotalContent(Math.max(0, creator.getTotalContent() - 1));
            creatorRepository.save(creator);
        });
    }

    @Transactional
    public CreatorContentDTO updateContent(Long creatorId, Long contentId, ContentUpdateRequest request) {
        Content content = contentRepository.findById(contentId)
                .orElseThrow(() -> new NotFoundException("İçerik bulunamadı"));
        if (!content.getCreatorId().equals(creatorId)) {
            throw new BadRequestException("Bu içeriği düzenleme yetkiniz yok");
        }
        content.setTitle(request.title());
        content.setDescription(request.description());
        if (request.thumbnailUrl() != null && !request.thumbnailUrl().isBlank()) {
            content.setThumbnail(request.thumbnailUrl());
        }
        if (request.topic() != null && !request.topic().isBlank()) {
            content.setTopic(request.topic());
        }
        if (request.category() != null && !request.category().isBlank()) {
            try {
                content.setCategory(ContentCategory.valueOf(request.category().trim().toUpperCase(Locale.ROOT)));
            } catch (IllegalArgumentException ignored) {}
        }
        BigDecimal earned = earningRepository.findEarningsGroupedByContent(creatorId)
                .stream()
                .filter(row -> ((Number) row[0]).longValue() == contentId)
                .map(row -> (BigDecimal) row[1])
                .findFirst()
                .orElse(BigDecimal.ZERO);
        long likeCount = userLikeRepository.countByContentId(contentId);
        return new CreatorContentDTO(
                content.getId(),
                content.getTitle(),
                content.getDescription(),
                content.getThumbnail(),
                content.getDuration(),
                content.isSubscriberOnly(),
                content.getViews(),
                content.getUploadDate(),
                DisplayFormatter.formatCurrencyDecimal(earned),
                content.getTopic(),
                content.getCategory() != null ? content.getCategory().toJson() : null,
                likeCount);
    }

    @Transactional(readOnly = true)
    public List<CreatorFollowerDTO> getFollowers(Long creatorId) {
        List<com.sochen.domain.UserFollow> follows =
                userFollowRepository.findAllByCreatorIdOrderByCreatedAtDesc(creatorId);
        if (follows.isEmpty()) return List.of();
        List<Long> userIds = follows.stream()
                .map(com.sochen.domain.UserFollow::getUserId).toList();
        java.util.Map<Long, com.sochen.domain.User> userMap = userRepository.findAllById(userIds)
                .stream()
                .collect(java.util.stream.Collectors.toMap(
                        com.sochen.domain.User::getId, u -> u));
        return follows.stream()
                .map(f -> {
                    com.sochen.domain.User u = userMap.get(f.getUserId());
                    if (u == null) return null;
                    String avatarUrl = u.getAvatarUrl() != null ? u.getAvatarUrl() : "";
                    String initials = DisplayFormatter.avatarInitials(u.getName());
                    return new CreatorFollowerDTO(u.getId(), u.getName(), avatarUrl, initials, f.getCreatedAt());
                })
                .filter(java.util.Objects::nonNull)
                .toList();
    }

    public UploadResponse storeUpload(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new BadRequestException("Dosya boş olamaz");
        }
        try {
            String uploadId = UUID.randomUUID().toString();
            String filename = sanitize(file.getOriginalFilename());
            String stored = uploadId + "_" + filename;
            Path destination = uploadRoot.resolve(stored);
            file.transferTo(destination);

            Integer pageCount = null;
            String ct = file.getContentType();
            if ("application/pdf".equals(ct) || (filename != null && filename.toLowerCase().endsWith(".pdf"))) {
                try (PDDocument doc = Loader.loadPDF(destination.toFile())) {
                    pageCount = doc.getNumberOfPages();
                } catch (Exception ignored) {
                    // page count is best-effort; don't fail the upload
                }
            }

            return new UploadResponse(uploadId, "/uploads/" + stored, pageCount);
        } catch (IOException ex) {
            throw new BadRequestException("Yükleme başarısız: " + ex.getMessage());
        }
    }

    private String displayName(CustomUserDetails details) {
        return userRepository.findById(details.getId())
                .map(com.sochen.domain.User::getName)
                .orElse(details.getUsername());
    }

    private String sanitize(String name) {
        if (name == null || name.isBlank()) return "upload.bin";
        return name.replaceAll("[^A-Za-z0-9._-]", "_");
    }
}
