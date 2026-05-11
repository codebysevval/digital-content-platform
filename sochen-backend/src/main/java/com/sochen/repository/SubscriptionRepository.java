package com.sochen.repository;

import com.sochen.domain.Subscription;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

public interface SubscriptionRepository extends JpaRepository<Subscription, Long> {
    Optional<Subscription> findByUserId(Long userId);

    List<Subscription> findAllByActive(boolean active);

    long countByActive(boolean active);

    @Query("SELECT COALESCE(SUM(s.price), 0) FROM Subscription s WHERE s.active = true")
    BigDecimal sumPriceByActive();
}
