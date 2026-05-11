package com.sochen.repository;

import com.sochen.domain.UserNotification;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface UserNotificationRepository extends JpaRepository<UserNotification, Long> {
    Optional<UserNotification> findByUserIdAndCreatorId(Long userId, Long creatorId);
}
