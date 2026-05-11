package com.sochen.repository;

import com.sochen.domain.CreatorApplication;
import com.sochen.domain.User;
import com.sochen.domain.enums.CreatorApplicationStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface CreatorApplicationRepository extends JpaRepository<CreatorApplication, Long> {
    List<CreatorApplication> findByStatusOrderByCreatedAtDesc(CreatorApplicationStatus status);
    boolean existsByUserAndStatus(User user, CreatorApplicationStatus status);
    Optional<CreatorApplication> findTopByUserOrderByCreatedAtDesc(User user);
}
