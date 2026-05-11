package com.sochen.repository;

import com.sochen.domain.MarketingPlan;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface MarketingPlanRepository extends JpaRepository<MarketingPlan, String> {
    List<MarketingPlan> findAllByOrderBySortOrderAsc();
}
