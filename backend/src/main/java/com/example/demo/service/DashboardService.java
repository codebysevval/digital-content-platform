package com.example.demo.service;

import com.example.demo.dto.ContentDTO;
import com.example.demo.dto.DashboardStatsDTO;
import com.example.demo.dto.SubscriptionDTO;
import com.example.demo.dto.UserDashboardDTO;
import com.example.demo.dto.UserSessionDTO;
import com.example.demo.entity.User;
import com.example.demo.mapper.DtoMapper;
import com.example.demo.repository.ContentRepository;
import com.example.demo.repository.SubscriptionRepository;
import com.example.demo.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class DashboardService {
    private final UserRepository userRepository;
    private final SubscriptionRepository subscriptionRepository;
    private final ContentRepository contentRepository;
    private final DtoMapper mapper;

    /**
     * Figma User Dashboard ekranındaki kullanıcı profili, abonelikler, içerikler ve sayaçları tek çağrıda üretir.
     */
    public UserDashboardDTO getDashboardByUsername(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new IllegalArgumentException("Dashboard için kullanıcı bulunamadı."));

        List<SubscriptionDTO> subscriptions = subscriptionRepository.findAllByUserId(user.getId())
                .stream()
                .map(mapper::toSubscriptionDto)
                .toList();

        List<ContentDTO> contents = contentRepository.findAllAccessibleByUserId(user.getId())
                .stream()
                .map(mapper::toContentDto)
                .toList();

        List<String> categories = contentRepository.findDistinctCategoriesByUserId(user.getId());

        DashboardStatsDTO stats = new DashboardStatsDTO(
                subscriptionRepository.countByUserId(user.getId()),
                subscriptionRepository.countByUserIdAndActiveTrue(user.getId()),
                contentRepository.countAccessibleByUserId(user.getId()),
                contentRepository.countPremiumAccessibleByUserId(user.getId()),
                categories.size()
        );

        UserSessionDTO profile = new UserSessionDTO(
                user.getId(),
                user.getUsername(),
                user.getEmail(),
                user.getFullName(),
                "ROLE_" + user.getRole()
        );

        return new UserDashboardDTO(profile, stats, categories, subscriptions, contents);
    }
}
