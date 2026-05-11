package com.sochen.repository;

import com.sochen.domain.PendingContent;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface PendingContentRepository extends JpaRepository<PendingContent, Long> {
    List<PendingContent> findAllByStatusOrderByUploadDateDesc(String status);
    long countByStatus(String status);
}
