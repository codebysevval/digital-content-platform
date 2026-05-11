package com.sochen.service;

import com.sochen.domain.DistributionRegion;
import com.sochen.domain.MonthlyMetric;
import com.sochen.domain.PendingContent;
import com.sochen.domain.Subscription;
import com.sochen.domain.SystemModule;
import com.sochen.domain.WeeklyDelivery;
import com.sochen.dto.response.AdminStatsDTO;
import com.sochen.dto.response.DistributionRegionDTO;
import com.sochen.dto.response.DistributionStatsDTO;
import com.sochen.dto.response.FinancialDataPointDTO;
import com.sochen.dto.response.ManagedUserDTO;
import com.sochen.dto.response.PendingContentDTO;
import com.sochen.dto.response.RevenueDataPointDTO;
import com.sochen.dto.response.SystemModuleDTO;
import com.sochen.dto.response.WeeklyDeliveryDayDTO;
import com.sochen.exception.BadRequestException;
import com.sochen.exception.NotFoundException;
import com.sochen.domain.Creator;
import com.sochen.domain.User;
import com.sochen.domain.enums.UserRole;
import com.sochen.dto.response.AdminUserItemDTO;
import com.sochen.repository.ContentHeartbeatRepository;
import com.sochen.repository.ContentRepository;
import com.sochen.repository.CreatorEarningRepository;
import com.sochen.repository.CreatorRepository;
import com.sochen.repository.DistributionRegionRepository;
import com.sochen.repository.ManagedUserViewRepository;
import com.sochen.repository.MonthlyMetricRepository;
import com.sochen.repository.OfflineContentRepository;
import com.sochen.repository.PendingContentRepository;
import com.sochen.repository.SubscriptionRepository;
import com.sochen.repository.SystemModuleRepository;
import com.sochen.repository.UserLikeRepository;
import com.sochen.repository.UserRepository;
import com.sochen.repository.WeeklyDeliveryRepository;
import com.sochen.util.DisplayFormatter;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.time.YearMonth;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;
import java.util.Set;

@Service
public class AdminService {

    private final PendingContentRepository pendingRepo;
    private final DistributionRegionRepository regionRepo;
    private final SystemModuleRepository systemRepo;
    private final WeeklyDeliveryRepository weeklyRepo;
    private final MonthlyMetricRepository metricRepo;
    private final ManagedUserViewRepository managedUserRepo;
    private final UserRepository userRepository;
    private final SubscriptionRepository subscriptionRepository;
    private final ContentRepository contentRepository;
    private final CreatorRepository creatorRepository;
    private final UserLikeRepository userLikeRepository;
    private final OfflineContentRepository offlineContentRepository;
    private final ContentHeartbeatRepository heartbeatRepository;
    private final CreatorEarningRepository earningRepository;

    public AdminService(PendingContentRepository pendingRepo,
                        DistributionRegionRepository regionRepo,
                        SystemModuleRepository systemRepo,
                        WeeklyDeliveryRepository weeklyRepo,
                        MonthlyMetricRepository metricRepo,
                        ManagedUserViewRepository managedUserRepo,
                        UserRepository userRepository,
                        SubscriptionRepository subscriptionRepository,
                        ContentRepository contentRepository,
                        CreatorRepository creatorRepository,
                        UserLikeRepository userLikeRepository,
                        OfflineContentRepository offlineContentRepository,
                        ContentHeartbeatRepository heartbeatRepository,
                        CreatorEarningRepository earningRepository) {
        this.pendingRepo = pendingRepo;
        this.regionRepo = regionRepo;
        this.systemRepo = systemRepo;
        this.weeklyRepo = weeklyRepo;
        this.metricRepo = metricRepo;
        this.managedUserRepo = managedUserRepo;
        this.userRepository = userRepository;
        this.subscriptionRepository = subscriptionRepository;
        this.contentRepository = contentRepository;
        this.creatorRepository = creatorRepository;
        this.userLikeRepository = userLikeRepository;
        this.offlineContentRepository = offlineContentRepository;
        this.heartbeatRepository = heartbeatRepository;
        this.earningRepository = earningRepository;
    }

    @Transactional(readOnly = true)
    public List<PendingContentDTO> listPending() {
        return pendingRepo.findAllByStatusOrderByUploadDateDesc("PENDING").stream()
                .map(this::toPendingDto)
                .toList();
    }

    @Transactional
    public void approve(Long id) {
        PendingContent pending = pendingRepo.findById(id)
                .orElseThrow(() -> new NotFoundException("Bekleyen içerik bulunamadı"));

        if ("APPROVED".equals(pending.getStatus())) {
            return;
        }
        pending.setStatus("APPROVED");

        com.sochen.domain.Content content = com.sochen.domain.Content.builder()
                .title(pending.getTitle())
                .category(pending.getCategory())
                .topic(pending.getTopic() != null && !pending.getTopic().isBlank()
                        ? pending.getTopic() : "general")
                .thumbnail(pending.getThumbnail())
                .duration(pending.getDuration() != null && !pending.getDuration().isBlank()
                        ? pending.getDuration() : "—")
                .subscriberOnly(pending.isSubscriberOnly())
                .uploadDate(pending.getUploadDate())
                .views(0L)
                .creator(pending.getCreator())
                .creatorId(pending.getCreatorId())
                .description(pending.getDescription() != null ? pending.getDescription() : "")
                .mediaUrl(pending.getMediaUrl())
                .simulationLikes(0L)
                .build();
        contentRepository.save(content);

        creatorRepository.findById(pending.getCreatorId()).ifPresent(creator -> {
            creator.setTotalContent(creator.getTotalContent() + 1);
            creatorRepository.save(creator);
        });
    }

    @Transactional
    public void reject(Long id, String reason) {
        if (reason == null || reason.isBlank()) {
            throw new BadRequestException("Reddetme sebebi belirtilmelidir");
        }
        PendingContent pending = pendingRepo.findById(id)
                .orElseThrow(() -> new NotFoundException("Bekleyen içerik bulunamadı"));
        pending.setStatus("REJECTED");
        pending.setRejectionReason(reason);
    }

    @Transactional(readOnly = true)
    public AdminStatsDTO getStats() {
        // Amortize yearly subscriptions (price/12) so MRR reflects monthly recurring revenue
        List<Subscription> activeSubscriptions = subscriptionRepository.findAllByActive(true);
        long activeSubscribers = activeSubscriptions.size();
        BigDecimal monthlyRevenue = activeSubscriptions.stream()
                .map(s -> "yearly".equalsIgnoreCase(s.getPlanId())
                        ? s.getPrice().divide(BigDecimal.valueOf(12), 2, java.math.RoundingMode.HALF_UP)
                        : s.getPrice())
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        long publishedContent    = contentRepository.count();
        long pendingApprovals    = pendingRepo.countByStatus("PENDING");
        long totalContent        = publishedContent + pendingApprovals;
        long totalUsers          = userRepository.countByRoleNot("ADMIN");

        BigDecimal arpu = activeSubscribers > 0
                ? monthlyRevenue.divide(BigDecimal.valueOf(activeSubscribers), 2, java.math.RoundingMode.HALF_UP)
                : BigDecimal.ZERO;

        return new AdminStatsDTO(
                DisplayFormatter.formatCurrencyDecimal(monthlyRevenue),
                "—",
                DisplayFormatter.formatThousands(activeSubscribers),
                "—",
                DisplayFormatter.formatThousands(publishedContent),
                pendingApprovals > 0 ? "+" + pendingApprovals + " beklemede" : "—",
                DisplayFormatter.formatThousands(totalUsers),
                "—",
                "%0,0",
                "—",
                DisplayFormatter.formatCurrencyDecimal(arpu),
                "—"
        );
    }

    @Transactional(readOnly = true)
    public List<FinancialDataPointDTO> getFinancialSeries() {
        List<Subscription> activeSubs = subscriptionRepository.findAllByActive(true);
        BigDecimal currentMrr = activeSubs.stream()
                .map(s -> "yearly".equalsIgnoreCase(s.getPlanId())
                        ? s.getPrice().divide(BigDecimal.valueOf(12), 2, RoundingMode.HALF_UP)
                        : s.getPrice())
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        int subCount = activeSubs.size();
        DateTimeFormatter fmt = DateTimeFormatter.ofPattern("MMM yyyy", new Locale("tr", "TR"));
        YearMonth now = YearMonth.now();
        List<FinancialDataPointDTO> result = new ArrayList<>();
        for (int i = 5; i >= 0; i--) {
            String label = now.minusMonths(i).atDay(1).format(fmt);
            result.add(new FinancialDataPointDTO(label, currentMrr, subCount));
        }
        return result;
    }

    @Transactional(readOnly = true)
    public List<RevenueDataPointDTO> getRevenueSeries() {
        List<Subscription> activeSubs = subscriptionRepository.findAllByActive(true);
        BigDecimal currentMrr = activeSubs.stream()
                .map(s -> "yearly".equalsIgnoreCase(s.getPlanId())
                        ? s.getPrice().divide(BigDecimal.valueOf(12), 2, RoundingMode.HALF_UP)
                        : s.getPrice())
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        DateTimeFormatter fmt = DateTimeFormatter.ofPattern("MMM yyyy", new Locale("tr", "TR"));
        YearMonth now = YearMonth.now();
        List<RevenueDataPointDTO> result = new ArrayList<>();
        for (int i = 5; i >= 0; i--) {
            String label = now.minusMonths(i).atDay(1).format(fmt);
            result.add(new RevenueDataPointDTO(label, currentMrr));
        }
        return result;
    }

    @Transactional(readOnly = true)
    public List<ManagedUserDTO> listManagedUsers(String context) {
        java.util.Map<Long, Subscription> subMap = subscriptionRepository.findAll().stream()
                .collect(java.util.stream.Collectors.toMap(Subscription::getUserId, s -> s,
                        (a, b) -> a));
        return userRepository.findAll().stream()
                .filter(u -> u.getRole() != UserRole.ADMIN)
                .sorted(java.util.Comparator.comparing(User::getName))
                .map(u -> {
                    Subscription sub = subMap.get(u.getId());
                    boolean active = sub != null && sub.isActive();
                    String tier = active ? sub.getPlanName() : "Ücretsiz";
                    String status = active ? "Aktif" : "Ücretsiz";
                    BigDecimal mrr = active ? sub.getPrice() : BigDecimal.ZERO;
                    return new ManagedUserDTO(u.getId(), u.getName(), u.getEmail(), tier, status, mrr);
                })
                .toList();
    }

    @Transactional(readOnly = true)
    public List<SystemModuleDTO> listSystemModules() {
        return systemRepo.findAllByOrderBySortOrderAsc().stream()
                .map(this::toSystemModuleDto)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<DistributionRegionDTO> listDistributionRegions() {
        return regionRepo.findAllByOrderByIdAsc().stream()
                .map(this::toRegionDto)
                .toList();
    }

    public DistributionStatsDTO getDistributionStats() {
        return new DistributionStatsDTO(
                47,
                7,
                DisplayFormatter.formatThousands(12_450),
                234,
                "%97.2"
        );
    }

    @Transactional(readOnly = true)
    public List<WeeklyDeliveryDayDTO> listWeeklyDeliveries() {
        return weeklyRepo.findAllByOrderByDayOfWeekAsc().stream()
                .map(d -> new WeeklyDeliveryDayDTO(d.getDayLabel(), d.getDeliveryCount()))
                .toList();
    }

    private PendingContentDTO toPendingDto(PendingContent p) {
        return new PendingContentDTO(
                p.getId(),
                p.getTitle(),
                p.getCreator(),
                p.getCategory().getModerationLabel(),
                DisplayFormatter.formatDisplayDate(p.getUploadDate()),
                p.getThumbnail(),
                p.getMediaUrl(),
                p.getCategory().toJson(),
                p.isSubscriberOnly()
        );
    }

    private SystemModuleDTO toSystemModuleDto(SystemModule m) {
        return new SystemModuleDTO(
                m.getName(),
                m.getStatus(),
                DisplayFormatter.formatPercentage(m.getUptimePercent()),
                DisplayFormatter.formatAbbreviatedCount(m.getRequestCount())
        );
    }

    private DistributionRegionDTO toRegionDto(DistributionRegion r) {
        return new DistributionRegionDTO(
                r.getId(),
                r.getRegion(),
                r.getDistributionPoints(),
                r.getMonthlyAmount(),
                DisplayFormatter.formatDisplayDate(r.getLastDelivery()),
                r.getStatus()
        );
    }

    // ── Phase 4: Geliştirici Araçları ────────────────────────────────────────

    @Transactional(readOnly = true)
    public List<AdminUserItemDTO> listAllUsers() {
        Set<Long> subscribedIds = subscriptionRepository.findAll().stream()
                .filter(com.sochen.domain.Subscription::isActive)
                .map(com.sochen.domain.Subscription::getUserId)
                .collect(java.util.stream.Collectors.toSet());
        return userRepository.findAll().stream()
                .map(u -> new AdminUserItemDTO(
                        u.getId(),
                        u.getName(),
                        u.getEmail(),
                        u.getRole().name(),
                        subscribedIds.contains(u.getId())))
                .toList();
    }

    @Transactional
    public void changeUserRole(Long userId, String role) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new NotFoundException("Kullanıcı bulunamadı"));
        UserRole newRole;
        try {
            newRole = UserRole.valueOf(role.toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new BadRequestException("Geçersiz rol: " + role);
        }
        user.setRole(newRole);
        if (newRole == UserRole.CREATOR && !creatorRepository.existsById(userId)) {
            creatorRepository.save(Creator.builder()
                    .id(userId)
                    .name(user.getName())
                    .avatar(DisplayFormatter.avatarInitials(user.getName()))
                    .type("Bağımsız İçerik Üreticisi")
                    .bio("")
                    .followers(0L)
                    .totalContent(0)
                    .totalViews(0L)
                    .build());
        }
    }

    @Transactional
    public void grantSubscription(Long userId, String planId, int months) {
        userRepository.findById(userId)
                .orElseThrow(() -> new NotFoundException("Kullanıcı bulunamadı"));
        String planName;
        BigDecimal price;
        if ("yearly".equalsIgnoreCase(planId)) {
            planName = "Yıllık Premium";
            price = new BigDecimal("999.00");
        } else {
            planName = "Aylık Premium";
            price = new BigDecimal("99.00");
        }
        java.util.Optional<com.sochen.domain.Subscription> existing = subscriptionRepository.findByUserId(userId);
        LocalDate nextBilling = LocalDate.now().plusMonths(months);
        if (existing.isPresent()) {
            com.sochen.domain.Subscription sub = existing.get();
            sub.setPlanId(planId);
            sub.setPlanName(planName);
            sub.setPrice(price);
            sub.setActive(true);
            sub.setNextBillingDate(nextBilling);
        } else {
            subscriptionRepository.save(com.sochen.domain.Subscription.builder()
                    .userId(userId)
                    .planId(planId)
                    .planName(planName)
                    .price(price)
                    .active(true)
                    .nextBillingDate(nextBilling)
                    .build());
        }
    }

    @Transactional
    public void simulateTraffic(Long contentId, long views, long likes) {
        contentRepository.findById(contentId)
                .orElseThrow(() -> new NotFoundException("İçerik bulunamadı"));
        contentRepository.addSimulatedTraffic(contentId, views, likes);
    }

    @Transactional
    public void deleteUser(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new NotFoundException("Kullanıcı bulunamadı"));
        if (user.getRole() == UserRole.ADMIN) {
            throw new BadRequestException("Admin kullanıcılar silinemez");
        }
        creatorRepository.findById(userId).ifPresent(creatorRepository::delete);
        subscriptionRepository.findByUserId(userId).ifPresent(subscriptionRepository::delete);
        userRepository.deleteById(userId);
    }

    @Transactional
    public void deleteContent(Long contentId) {
        if (!contentRepository.existsById(contentId)) {
            throw new NotFoundException("İçerik bulunamadı");
        }
        userLikeRepository.deleteAllByContentId(contentId);
        offlineContentRepository.deleteAllByContentId(contentId);
        earningRepository.deleteAllByContentId(contentId);
        heartbeatRepository.deleteAllByContentId(contentId);
        contentRepository.deleteById(contentId);
    }
}
