package com.sochen.repository;

import com.sochen.domain.CheckoutPlan;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CheckoutPlanRepository extends JpaRepository<CheckoutPlan, String> {
    List<CheckoutPlan> findAllByOrderBySortOrderAsc();
}
