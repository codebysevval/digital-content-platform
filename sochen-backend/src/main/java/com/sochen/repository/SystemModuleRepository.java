package com.sochen.repository;

import com.sochen.domain.SystemModule;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface SystemModuleRepository extends JpaRepository<SystemModule, Long> {
    List<SystemModule> findAllByOrderBySortOrderAsc();
}
