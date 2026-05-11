package com.sochen.repository;

import com.sochen.domain.Content;
import com.sochen.domain.enums.ContentCategory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface ContentRepository extends JpaRepository<Content, Long> {

    List<Content> findAllByCreatorIdOrderByUploadDateDesc(Long creatorId);

    List<Content> findTop3ByCategoryAndIdNotOrderByViewsDesc(ContentCategory category, Long excludeId);

    long countByCreatorId(Long creatorId);

    @Query("SELECT COALESCE(SUM(c.views), 0) FROM Content c WHERE c.creatorId = :creatorId")
    long sumViewsByCreatorId(@Param("creatorId") Long creatorId);

    @Modifying
    @Query("UPDATE Content c SET c.views = c.views + 1 WHERE c.id = :id")
    void incrementViews(@Param("id") Long id);

    @Modifying
    @Query("UPDATE Content c SET c.views = c.views + :views, c.simulationLikes = c.simulationLikes + :likes WHERE c.id = :id")
    void addSimulatedTraffic(@Param("id") Long id, @Param("views") long views, @Param("likes") long likes);

    List<Content> findAllByCreatorIdInOrderByUploadDateDesc(List<Long> creatorIds);
}
