package com.sochen.repository;

import com.sochen.domain.PricingPlan;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface PricingPlanRepository extends JpaRepository<PricingPlan, String> {
    List<PricingPlan> findAllByOrderBySortOrderAsc();
}
