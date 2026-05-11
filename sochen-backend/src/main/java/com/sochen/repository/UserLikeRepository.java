package com.sochen.repository;

import com.sochen.domain.UserLike;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface UserLikeRepository extends JpaRepository<UserLike, Long> {

    List<UserLike> findAllByUserIdOrderByCreatedAtDesc(Long userId);

    Optional<UserLike> findByUserIdAndContentId(Long userId, Long contentId);

    @Query("SELECT COUNT(ul) FROM UserLike ul WHERE ul.contentId IN " +
           "(SELECT c.id FROM Content c WHERE c.creatorId = :creatorId)")
    long countLikesForCreator(@Param("creatorId") Long creatorId);

    @Query("SELECT ul.contentId, COUNT(ul) FROM UserLike ul GROUP BY ul.contentId")
    List<Object[]> countGroupedByContent();

    @Query("SELECT ul.contentId, COUNT(ul) FROM UserLike ul WHERE ul.contentId IN :contentIds GROUP BY ul.contentId")
    List<Object[]> countGroupedByContentIdIn(@Param("contentIds") List<Long> contentIds);

    long countByContentId(Long contentId);

    void deleteAllByContentId(Long contentId);
}
