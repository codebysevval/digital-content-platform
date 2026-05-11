package com.sochen.repository;

import com.sochen.domain.ManagedUserView;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ManagedUserViewRepository extends JpaRepository<ManagedUserView, Long> {
    List<ManagedUserView> findAllByContextOrderBySortOrderAsc(String context);
}
