package com.sochen.repository;

import com.sochen.domain.OfflineContent;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface OfflineContentRepository extends JpaRepository<OfflineContent, Long> {

    List<OfflineContent> findAllByUserIdOrderByDownloadDateDesc(Long userId);

    Optional<OfflineContent> findByUserIdAndContentId(Long userId, Long contentId);

    Optional<OfflineContent> findByUserIdAndId(Long userId, Long id);

    long countByUserId(Long userId);

    void deleteAllByContentId(Long contentId);
}
