package com.sochen.service;

import com.sochen.domain.Creator;
import com.sochen.domain.CreatorApplication;
import com.sochen.domain.User;
import com.sochen.domain.enums.CreatorApplicationStatus;
import com.sochen.domain.enums.UserRole;
import com.sochen.dto.response.CreatorApplicationDTO;
import com.sochen.exception.ConflictException;
import com.sochen.exception.NotFoundException;
import com.sochen.repository.CreatorApplicationRepository;
import com.sochen.repository.CreatorRepository;
import com.sochen.repository.UserRepository;
import com.sochen.util.DisplayFormatter;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class CreatorApplicationService {

    private final CreatorApplicationRepository applicationRepository;
    private final UserRepository userRepository;
    private final CreatorRepository creatorRepository;

    public CreatorApplicationService(CreatorApplicationRepository applicationRepository,
                                     UserRepository userRepository,
                                     CreatorRepository creatorRepository) {
        this.applicationRepository = applicationRepository;
        this.userRepository = userRepository;
        this.creatorRepository = creatorRepository;
    }

    @Transactional
    public CreatorApplicationDTO apply(Long userId, String rationale) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new NotFoundException("Kullanıcı bulunamadı"));

        if (user.getRole() == UserRole.CREATOR || user.getRole() == UserRole.ADMIN) {
            throw new ConflictException("Zaten bir içerik üreticisisiniz");
        }
        if (applicationRepository.existsByUserAndStatus(user, CreatorApplicationStatus.PENDING)) {
            throw new ConflictException("Zaten bekleyen bir başvurunuz var");
        }

        CreatorApplication app = CreatorApplication.builder()
                .user(user)
                .rationale(rationale)
                .status(CreatorApplicationStatus.PENDING)
                .createdAt(OffsetDateTime.now())
                .build();
        app = applicationRepository.save(app);
        return toDto(app);
    }

    @Transactional(readOnly = true)
    public Optional<CreatorApplicationDTO> getMyApplication(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new NotFoundException("Kullanıcı bulunamadı"));
        return applicationRepository.findTopByUserOrderByCreatedAtDesc(user)
                .map(this::toDto);
    }

    @Transactional(readOnly = true)
    public List<CreatorApplicationDTO> getPendingApplications() {
        return applicationRepository.findByStatusOrderByCreatedAtDesc(CreatorApplicationStatus.PENDING)
                .stream()
                .map(this::toDto)
                .toList();
    }

    @Transactional
    public void approve(Long applicationId) {
        CreatorApplication app = applicationRepository.findById(applicationId)
                .orElseThrow(() -> new NotFoundException("Başvuru bulunamadı"));
        if (app.getStatus() != CreatorApplicationStatus.PENDING) {
            throw new ConflictException("Bu başvuru zaten işleme alınmış");
        }

        User user = app.getUser();
        user.setRole(UserRole.CREATOR);
        user.setUpdatedAt(OffsetDateTime.now());
        userRepository.save(user);

        if (!creatorRepository.existsById(user.getId())) {
            Creator creator = Creator.builder()
                    .id(user.getId())
                    .name(user.getName())
                    .avatar(DisplayFormatter.avatarInitials(user.getName()))
                    .type("İçerik Üretici")
                    .bio("")
                    .followers(0L)
                    .totalContent(0)
                    .totalViews(0L)
                    .build();
            creatorRepository.save(creator);
        }

        app.setStatus(CreatorApplicationStatus.APPROVED);
        applicationRepository.save(app);
    }

    @Transactional
    public void reject(Long applicationId, String reason) {
        CreatorApplication app = applicationRepository.findById(applicationId)
                .orElseThrow(() -> new NotFoundException("Başvuru bulunamadı"));
        if (app.getStatus() != CreatorApplicationStatus.PENDING) {
            throw new ConflictException("Bu başvuru zaten işleme alınmış");
        }
        app.setStatus(CreatorApplicationStatus.REJECTED);
        app.setRejectionReason(reason);
        applicationRepository.save(app);
    }

    private CreatorApplicationDTO toDto(CreatorApplication app) {
        return new CreatorApplicationDTO(
                app.getId(),
                app.getUser().getId(),
                app.getUser().getName(),
                app.getRationale(),
                app.getStatus().name().toLowerCase(),
                app.getCreatedAt().toLocalDate().toString()
        );
    }
}
