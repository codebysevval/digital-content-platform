package com.sochen.service;

import com.sochen.domain.BillingRecord;
import com.sochen.domain.CheckoutPlan;
import com.sochen.domain.PricingPlan;
import com.sochen.domain.Subscription;
import com.sochen.domain.UsageQuota;
import com.sochen.dto.response.BillingHistoryItemDTO;
import com.sochen.dto.response.SubscriptionStatusDTO;
import com.sochen.dto.response.UsageQuotaDTO;
import com.sochen.exception.NotFoundException;
import com.sochen.repository.BillingRecordRepository;
import com.sochen.repository.CheckoutPlanRepository;
import com.sochen.repository.PricingPlanRepository;
import com.sochen.repository.SubscriptionRepository;
import com.sochen.repository.UsageQuotaRepository;
import com.sochen.util.DisplayFormatter;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Service
public class SubscriptionService {

    private static final List<String> DEFAULT_FEATURES = List.of(
            "Tüm premium içeriklere sınırsız erişim",
            "Offline içerik indirme",
            "HD kalitede video izleme",
            "Öncelikli müşteri desteği"
    );

    private final SubscriptionRepository subscriptionRepository;
    private final BillingRecordRepository billingRepository;
    private final UsageQuotaRepository usageRepository;
    private final PricingPlanRepository pricingRepo;
    private final CheckoutPlanRepository checkoutRepo;

    public SubscriptionService(SubscriptionRepository subscriptionRepository,
                               BillingRecordRepository billingRepository,
                               UsageQuotaRepository usageRepository,
                               PricingPlanRepository pricingRepo,
                               CheckoutPlanRepository checkoutRepo) {
        this.subscriptionRepository = subscriptionRepository;
        this.billingRepository = billingRepository;
        this.usageRepository = usageRepository;
        this.pricingRepo = pricingRepo;
        this.checkoutRepo = checkoutRepo;
    }

    @Transactional(readOnly = true)
    public SubscriptionStatusDTO getStatus(Long userId) {
        return subscriptionRepository.findByUserId(userId)
                .map(this::toStatusDto)
                .orElseGet(() -> new SubscriptionStatusDTO(
                        "Ücretsiz",
                        BigDecimal.ZERO,
                        false,
                        DisplayFormatter.formatTurkishLongDate(LocalDate.now().plusMonths(1)),
                        DEFAULT_FEATURES));
    }

    @Transactional(readOnly = true)
    public List<BillingHistoryItemDTO> listBilling(Long userId) {
        return billingRepository.findAllByUserIdOrderByBillingDateDesc(userId).stream()
                .map(this::toBillingDto)
                .toList();
    }

    @Transactional(readOnly = true)
    public UsageQuotaDTO getUsage(Long userId) {
        UsageQuota quota = usageRepository.findByUserId(userId)
                .orElseGet(() -> UsageQuota.builder()
                        .userId(userId)
                        .apiCallsUsed(0)
                        .apiCallsLimit(10_000)
                        .storageUsedGb(0)
                        .storageLimitGb(100)
                        .teamMembersUsed(1)
                        .teamMembersLimit(15)
                        .build());
        return new UsageQuotaDTO(
                quota.getApiCallsUsed(),
                quota.getApiCallsLimit(),
                quota.getStorageUsedGb(),
                quota.getStorageLimitGb(),
                quota.getTeamMembersUsed(),
                quota.getTeamMembersLimit()
        );
    }

    @Transactional
    public void cancel(Long userId) {
        subscriptionRepository.findByUserId(userId).ifPresent(sub -> {
            sub.setActive(false);
        });
    }

    @Transactional
    public Subscription activatePlan(Long userId, String planId) {
        ResolvedPlan resolved = resolvePlan(planId);
        Subscription sub = subscriptionRepository.findByUserId(userId)
                .orElseGet(() -> Subscription.builder()
                        .userId(userId)
                        .build());
        sub.setPlanId(planId);
        sub.setPlanName(resolved.name);
        sub.setPrice(resolved.price);
        sub.setActive(true);
        sub.setNextBillingDate("yearly".equalsIgnoreCase(planId)
                ? LocalDate.now().plusYears(1)
                : LocalDate.now().plusMonths(1));
        return subscriptionRepository.save(sub);
    }

    public SubscriptionStatusDTO toStatusDto(Subscription sub) {
        return new SubscriptionStatusDTO(
                sub.getPlanName(),
                sub.getPrice(),
                sub.isActive(),
                DisplayFormatter.formatTurkishLongDate(sub.getNextBillingDate()),
                DEFAULT_FEATURES
        );
    }

    private BillingHistoryItemDTO toBillingDto(BillingRecord record) {
        return new BillingHistoryItemDTO(
                record.getId(),
                DisplayFormatter.formatDisplayDate(record.getBillingDate()),
                DisplayFormatter.formatCurrency(record.getAmount()),
                record.getPlanLabel(),
                record.getStatus()
        );
    }

    public ResolvedPlan resolvePlan(String planId) {
        Optional<PricingPlan> pricing = pricingRepo.findById(planId);
        if (pricing.isPresent()) {
            return new ResolvedPlan(pricing.get().getName(), pricing.get().getPrice());
        }
        Optional<CheckoutPlan> checkout = checkoutRepo.findById(planId);
        if (checkout.isPresent()) {
            return new ResolvedPlan(checkout.get().getName(), checkout.get().getPrice());
        }
        throw new NotFoundException("Plan bulunamadı: " + planId);
    }

    public record ResolvedPlan(String name, BigDecimal price) {
    }
}
