package com.sochen.service;

import com.sochen.domain.Content;
import com.sochen.domain.OfflineContent;
import com.sochen.domain.Subscription;
import com.sochen.dto.request.AddOfflineRequest;
import com.sochen.dto.response.OfflineContentDTO;
import com.sochen.exception.BadRequestException;
import com.sochen.exception.ConflictException;
import com.sochen.exception.NotFoundException;
import com.sochen.repository.ContentRepository;
import com.sochen.repository.OfflineContentRepository;
import com.sochen.repository.SubscriptionRepository;
import com.sochen.util.DisplayFormatter;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDate;
import java.util.List;
import java.util.Locale;
import java.util.Optional;

@Service
public class OfflineService {

    public static final int STORAGE_LIMIT_MB = 10_240;
    private static final int DEFAULT_SIZE_MB = 50;
    private static final int MONTHLY_DOWNLOAD_LIMIT = 10;
    private static final int YEARLY_DOWNLOAD_LIMIT  = 20;

    private final OfflineContentRepository offlineRepository;
    private final ContentRepository contentRepository;
    private final SubscriptionRepository subscriptionRepository;
    private final Path uploadRoot;

    public OfflineService(OfflineContentRepository offlineRepository,
                          ContentRepository contentRepository,
                          SubscriptionRepository subscriptionRepository,
                          Path uploadRoot) {
        this.offlineRepository = offlineRepository;
        this.contentRepository = contentRepository;
        this.subscriptionRepository = subscriptionRepository;
        this.uploadRoot = uploadRoot;
    }

    @Transactional(readOnly = true)
    public List<OfflineContentDTO> list(Long userId) {
        return offlineRepository.findAllByUserIdOrderByDownloadDateDesc(userId).stream()
                .map(offline -> toDto(offline, contentRepository.findById(offline.getContentId()).orElse(null)))
                .filter(java.util.Objects::nonNull)
                .toList();
    }

    @Transactional
    public OfflineContentDTO add(Long userId, AddOfflineRequest request) {
        Content content = contentRepository.findById(request.id())
                .orElseThrow(() -> new NotFoundException("İçerik bulunamadı"));

        int downloadLimit = resolveDownloadLimit(userId);
        long currentDownloads = offlineRepository.countByUserId(userId);
        if (currentDownloads >= downloadLimit) {
            throw new BadRequestException(
                    "İndirme limitinize ulaştınız: " + currentDownloads + "/" + downloadLimit);
        }

        if (offlineRepository.findByUserIdAndContentId(userId, content.getId()).isPresent()) {
            throw new ConflictException("Bu içerik zaten indirildi");
        }

        int sizeMb = (request.size() != null && !request.size().isBlank())
                ? parseSizeMb(request.size())
                : sizeFromContent(content);
        int currentTotal = offlineRepository.findAllByUserIdOrderByDownloadDateDesc(userId).stream()
                .mapToInt(OfflineContent::getSizeMb)
                .sum();
        if (currentTotal + sizeMb > STORAGE_LIMIT_MB) {
            throw new ConflictException("Depolama limiti doldu");
        }

        OfflineContent saved = offlineRepository.save(OfflineContent.builder()
                .userId(userId)
                .contentId(content.getId())
                .sizeMb(sizeMb)
                .downloadDate(LocalDate.now())
                .build());
        return toDto(saved, content);
    }

    @Transactional
    public void delete(Long userId, Long offlineId) {
        OfflineContent record = offlineRepository.findByUserIdAndId(userId, offlineId)
                .orElseThrow(() -> new NotFoundException("Çevrimdışı kayıt bulunamadı"));
        offlineRepository.delete(record);
    }

    private OfflineContentDTO toDto(OfflineContent offline, Content content) {
        if (content == null) return null;
        return new OfflineContentDTO(
                offline.getId(),
                content.getTitle(),
                content.getCategory(),
                content.getThumbnail(),
                offline.getSizeMb() + " MB",
                DisplayFormatter.formatDisplayDate(offline.getDownloadDate()),
                content.getDuration(),
                content.getViews(),
                content.isSubscriberOnly(),
                content.getCreator()
        );
    }

    private int resolveDownloadLimit(Long userId) {
        Optional<Subscription> sub = subscriptionRepository.findByUserId(userId);
        if (sub.isEmpty() || !sub.get().isActive()) {
            throw new BadRequestException("Ücretsiz planda indirme özelliği mevcut değil. Premium plana geçin.");
        }
        return switch (sub.get().getPlanId()) {
            case "yearly" -> YEARLY_DOWNLOAD_LIMIT;
            case "monthly" -> MONTHLY_DOWNLOAD_LIMIT;
            default -> throw new BadRequestException("Ücretsiz planda indirme özelliği mevcut değil. Premium plana geçin.");
        };
    }

    private int sizeFromContent(Content content) {
        String mediaUrl = content.getMediaUrl();
        if (mediaUrl != null && !mediaUrl.isBlank()) {
            String filename = Paths.get(mediaUrl).getFileName().toString();
            Path file = uploadRoot.resolve(filename);
            try {
                long bytes = Files.size(file);
                int mb = (int) Math.ceil(bytes / 1_048_576.0);
                return mb > 0 ? mb : 1;
            } catch (IOException ignored) {
                // file not found or unreadable; fall through
            }
        }
        return DEFAULT_SIZE_MB;
    }

    private int parseSizeMb(String size) {
        String trimmed = size.trim().toUpperCase(Locale.ROOT);
        StringBuilder digits = new StringBuilder();
        for (char ch : trimmed.toCharArray()) {
            if (Character.isDigit(ch) || ch == '.' || ch == ',') {
                digits.append(ch == ',' ? '.' : ch);
            }
        }
        if (digits.length() == 0) return DEFAULT_SIZE_MB;
        double value = Double.parseDouble(digits.toString());
        if (trimmed.contains("GB")) {
            value *= 1024;
        }
        return (int) Math.round(value);
    }
}
