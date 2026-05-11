package com.sochen.repository;

import com.sochen.domain.CreatorEarning;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.math.BigDecimal;
import java.util.List;

public interface CreatorEarningRepository extends JpaRepository<CreatorEarning, Long> {

    @Query(value = "SELECT COALESCE(SUM(amount), 0) FROM creator_earnings " +
                   "WHERE creator_id = :creatorId AND DATE_TRUNC('month', earned_at) = DATE_TRUNC('month', NOW())",
           nativeQuery = true)
    BigDecimal sumCurrentMonthByCreatorId(@Param("creatorId") Long creatorId);

    @Query(value = "SELECT COALESCE(SUM(amount), 0) FROM creator_earnings WHERE creator_id = :creatorId",
           nativeQuery = true)
    BigDecimal sumTotalByCreatorId(@Param("creatorId") Long creatorId);

    @Query(value = "SELECT TO_CHAR(earned_at AT TIME ZONE 'UTC', 'YYYY-MM') AS month_key, " +
                   "SUM(amount) AS total " +
                   "FROM creator_earnings WHERE creator_id = :creatorId " +
                   "GROUP BY month_key ORDER BY month_key ASC",
           nativeQuery = true)
    List<Object[]> findMonthlyEarnings(@Param("creatorId") Long creatorId);

    @Query(value = "SELECT content_id, COALESCE(SUM(amount), 0) AS total " +
                   "FROM creator_earnings WHERE creator_id = :creatorId " +
                   "GROUP BY content_id",
           nativeQuery = true)
    List<Object[]> findEarningsGroupedByContent(@Param("creatorId") Long creatorId);

    void deleteAllByContentId(Long contentId);
}
