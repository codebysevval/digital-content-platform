package com.sochen.repository;

import com.sochen.domain.ContentHeartbeat;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ContentHeartbeatRepository extends JpaRepository<ContentHeartbeat, Long> {

    void deleteAllByContentId(Long contentId);
}
