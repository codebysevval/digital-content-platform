package com.sochen.repository;

import com.sochen.domain.ContentTopic;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ContentTopicRepository extends JpaRepository<ContentTopic, Long> {
    List<ContentTopic> findAllByContentIdOrderBySortOrderAsc(Long contentId);
}
