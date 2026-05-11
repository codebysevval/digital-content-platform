package com.sochen.service;

import com.sochen.domain.CheckoutPlan;
import com.sochen.domain.MarketingPlan;
import com.sochen.domain.PricingPlan;
import com.sochen.dto.response.CheckoutPlanDTO;
import com.sochen.dto.response.PricingPlanDTO;
import com.sochen.dto.response.YearlyTogglePlanDTO;
import com.sochen.repository.CheckoutPlanRepository;
import com.sochen.repository.MarketingPlanRepository;
import com.sochen.repository.PricingPlanRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class PlanService {

    private final PricingPlanRepository pricingRepo;
    private final CheckoutPlanRepository checkoutRepo;
    private final MarketingPlanRepository marketingRepo;

    public PlanService(PricingPlanRepository pricingRepo,
                       CheckoutPlanRepository checkoutRepo,
                       MarketingPlanRepository marketingRepo) {
        this.pricingRepo = pricingRepo;
        this.checkoutRepo = checkoutRepo;
        this.marketingRepo = marketingRepo;
    }

    @Transactional(readOnly = true)
    public List<PricingPlanDTO> listPricing() {
        return pricingRepo.findAllByOrderBySortOrderAsc().stream()
                .map(this::toPricingDto)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<CheckoutPlanDTO> listCheckout() {
        return checkoutRepo.findAllByOrderBySortOrderAsc().stream()
                .map(this::toCheckoutDto)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<YearlyTogglePlanDTO> listMarketing() {
        return marketingRepo.findAllByOrderBySortOrderAsc().stream()
                .map(this::toMarketingDto)
                .toList();
    }

    private PricingPlanDTO toPricingDto(PricingPlan plan) {
        return new PricingPlanDTO(
                plan.getId(),
                plan.getName(),
                plan.getIconKey(),
                plan.getPrice(),
                plan.getPeriod(),
                plan.getDescription(),
                splitFeatures(plan.getFeatures()),
                plan.getColor(),
                plan.isFree() ? Boolean.TRUE : null,
                plan.isRecommended() ? Boolean.TRUE : null,
                plan.getSavings()
        );
    }

    private CheckoutPlanDTO toCheckoutDto(CheckoutPlan plan) {
        return new CheckoutPlanDTO(
                plan.getId(),
                plan.getName(),
                plan.getPrice(),
                plan.getPeriod(),
                plan.isPopular() ? Boolean.TRUE : null,
                plan.getSavings(),
                splitFeatures(plan.getFeatures())
        );
    }

    private YearlyTogglePlanDTO toMarketingDto(MarketingPlan plan) {
        return new YearlyTogglePlanDTO(
                plan.getName(),
                plan.getIconKey(),
                plan.getMonthlyPrice(),
                plan.getYearlyPrice(),
                plan.getDescription(),
                splitFeatures(plan.getFeatures()),
                plan.getColor(),
                plan.isRecommended() ? Boolean.TRUE : null
        );
    }

    private List<String> splitFeatures(String raw) {
        if (raw == null || raw.isBlank()) return List.of();
        return List.of(raw.split("\\s*\\|\\s*"));
    }
}
