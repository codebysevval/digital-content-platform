package com.sochen.service;

import com.sochen.domain.Content;
import com.sochen.domain.ContentHeartbeat;
import com.sochen.domain.CreatorEarning;
import com.sochen.domain.enums.ContentCategory;
import com.sochen.exception.NotFoundException;
import com.sochen.repository.ContentHeartbeatRepository;
import com.sochen.repository.ContentRepository;
import com.sochen.repository.CreatorEarningRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.OffsetDateTime;

@Service
public class HeartbeatService {

    private static final BigDecimal BASE_RATE = new BigDecimal("0.00015");

    private final ContentRepository contentRepository;
    private final ContentHeartbeatRepository heartbeatRepository;
    private final CreatorEarningRepository earningRepository;

    public HeartbeatService(ContentRepository contentRepository,
                            ContentHeartbeatRepository heartbeatRepository,
                            CreatorEarningRepository earningRepository) {
        this.contentRepository = contentRepository;
        this.heartbeatRepository = heartbeatRepository;
        this.earningRepository = earningRepository;
    }

    @Transactional
    public void recordHeartbeat(Long userId, Long contentId) {
        Content content = contentRepository.findById(contentId)
                .orElseThrow(() -> new NotFoundException("İçerik bulunamadı"));

        OffsetDateTime now = OffsetDateTime.now();

        ContentHeartbeat heartbeat = heartbeatRepository.save(ContentHeartbeat.builder()
                .contentId(contentId)
                .userId(userId)
                .createdAt(now)
                .build());

        BigDecimal amount = BASE_RATE.multiply(multiplierFor(content.getCategory()));

        earningRepository.save(CreatorEarning.builder()
                .creatorId(content.getCreatorId())
                .contentId(contentId)
                .heartbeatId(heartbeat.getId())
                .amount(amount)
                .earnedAt(now)
                .build());
    }

    private BigDecimal multiplierFor(ContentCategory category) {
        return switch (category) {
            case COURSES  -> new BigDecimal("1.0");
            case PODCASTS -> new BigDecimal("0.7");
            default       -> new BigDecimal("0.3");
        };
    }
}
