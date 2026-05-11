package com.sochen.controller;

import com.sochen.dto.response.BillingHistoryItemDTO;
import com.sochen.dto.response.CheckoutPlanDTO;
import com.sochen.dto.response.PricingPlanDTO;
import com.sochen.dto.response.SubscriptionStatusDTO;
import com.sochen.dto.response.UsageQuotaDTO;
import com.sochen.dto.response.YearlyTogglePlanDTO;
import com.sochen.security.AuthenticationFacade;
import com.sochen.service.PlanService;
import com.sochen.service.SubscriptionService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api")
public class SubscriptionController {

    private final SubscriptionService subscriptionService;
    private final PlanService planService;
    private final AuthenticationFacade authFacade;

    public SubscriptionController(SubscriptionService subscriptionService,
                                  PlanService planService,
                                  AuthenticationFacade authFacade) {
        this.subscriptionService = subscriptionService;
        this.planService = planService;
        this.authFacade = authFacade;
    }

    @GetMapping("/plans/pricing")
    public ResponseEntity<List<PricingPlanDTO>> pricingPlans() {
        return ResponseEntity.ok(planService.listPricing());
    }

    @GetMapping("/plans/checkout")
    public ResponseEntity<List<CheckoutPlanDTO>> checkoutPlans() {
        return ResponseEntity.ok(planService.listCheckout());
    }

    @GetMapping("/plans/marketing")
    public ResponseEntity<List<YearlyTogglePlanDTO>> marketingPlans() {
        return ResponseEntity.ok(planService.listMarketing());
    }

    @GetMapping("/users/me/subscription")
    public ResponseEntity<SubscriptionStatusDTO> status() {
        return ResponseEntity.ok(subscriptionService.getStatus(authFacade.currentUserId()));
    }

    @GetMapping("/users/me/billing")
    public ResponseEntity<List<BillingHistoryItemDTO>> billing() {
        return ResponseEntity.ok(subscriptionService.listBilling(authFacade.currentUserId()));
    }

    @GetMapping("/users/me/usage")
    public ResponseEntity<UsageQuotaDTO> usage() {
        return ResponseEntity.ok(subscriptionService.getUsage(authFacade.currentUserId()));
    }

    @DeleteMapping("/users/me/subscription")
    public ResponseEntity<Void> cancel() {
        subscriptionService.cancel(authFacade.currentUserId());
        return ResponseEntity.noContent().build();
    }
}
