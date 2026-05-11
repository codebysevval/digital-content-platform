package com.sochen.repository;

import com.sochen.domain.UserFollow;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface UserFollowRepository extends JpaRepository<UserFollow, Long> {

    List<UserFollow> findAllByUserIdOrderByCreatedAtDesc(Long userId);

    List<UserFollow> findAllByCreatorIdOrderByCreatedAtDesc(Long creatorId);

    Optional<UserFollow> findByUserIdAndCreatorId(Long userId, Long creatorId);
}
