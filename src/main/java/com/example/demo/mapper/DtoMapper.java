package com.example.demo.mapper;

import com.example.demo.dto.ContentDTO;
import com.example.demo.dto.SubscriptionDTO;
import com.example.demo.dto.UserDTO;
import com.example.demo.entity.Content;
import com.example.demo.entity.Subscription;
import com.example.demo.entity.User;
import org.springframework.stereotype.Component;

import java.util.stream.Collectors;

@Component
public class DtoMapper {

    public UserDTO toUserDto(User user) {
        return UserDTO.builder()
                .id(user.getId())
                .username(user.getUsername())
                .email(user.getEmail())
                .fullName(user.getFullName())
                .role(user.getRole())
                .subscriptionIds(user.getSubscriptions().stream().map(Subscription::getId).collect(Collectors.toList()))
                .contentIds(user.getAccessibleContents().stream().map(Content::getId).collect(Collectors.toList()))
                .build();
    }

    public SubscriptionDTO toSubscriptionDto(Subscription subscription) {
        return SubscriptionDTO.builder()
                .id(subscription.getId())
                .planName(subscription.getPlanName())
                .price(subscription.getPrice())
                .currency(subscription.getCurrency())
                .billingCycle(subscription.getBillingCycle())
                .startDate(subscription.getStartDate())
                .endDate(subscription.getEndDate())
                .active(subscription.isActive())
                .userId(subscription.getUser().getId())
                .build();
    }

    public ContentDTO toContentDto(Content content) {
        return ContentDTO.builder()
                .id(content.getId())
                .title(content.getTitle())
                .category(content.getCategory())
                .thumbnailUrl(content.getThumbnailUrl())
                .durationMinutes(content.getDurationMinutes())
                .premium(content.isPremium())
                .userIds(content.getUsers().stream().map(User::getId).collect(Collectors.toList()))
                .build();
    }
}
