package com.sochen.repository;

import com.sochen.domain.ContentModule;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ContentModuleRepository extends JpaRepository<ContentModule, Long> {
    List<ContentModule> findAllByContentIdOrderBySortOrderAsc(Long contentId);
}
