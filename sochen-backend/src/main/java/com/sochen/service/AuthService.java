package com.sochen.service;

import com.sochen.domain.Creator;
import com.sochen.domain.User;
import com.sochen.domain.enums.UserRole;
import com.sochen.dto.request.LoginRequest;
import com.sochen.dto.request.PasswordChangeRequest;
import com.sochen.dto.request.ProfileUpdateRequest;
import com.sochen.dto.request.SignupRequest;
import com.sochen.dto.response.AuthResponse;
import com.sochen.dto.response.UserDTO;
import com.sochen.exception.BadRequestException;
import com.sochen.exception.ConflictException;
import com.sochen.exception.NotFoundException;
import com.sochen.mapper.UserMapper;
import com.sochen.repository.CreatorRepository;
import com.sochen.repository.UserRepository;
import com.sochen.security.JwtUtil;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class AuthService {

    private static final Logger log = LoggerFactory.getLogger(AuthService.class);

    /** In-memory token store for local testing only. Replace with DB persistence in production. */
    private final Map<String, Long> passwordResetTokens = new ConcurrentHashMap<>();

    private final UserRepository userRepository;
    private final CreatorRepository creatorRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final UserMapper userMapper;

    public AuthService(UserRepository userRepository,
                       CreatorRepository creatorRepository,
                       PasswordEncoder passwordEncoder,
                       JwtUtil jwtUtil,
                       UserMapper userMapper) {
        this.userRepository = userRepository;
        this.creatorRepository = creatorRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtil = jwtUtil;
        this.userMapper = userMapper;
    }

    @Transactional
    public AuthResponse login(LoginRequest request) {
        User user = userRepository.findByEmailIgnoreCase(request.email())
                .orElseThrow(() -> new BadCredentialsException("E-posta veya şifre hatalı"));
        if (!passwordEncoder.matches(request.password(), user.getPasswordHash())) {
            throw new BadCredentialsException("E-posta veya şifre hatalı");
        }
        String token = jwtUtil.generateToken(user.getId(), user.getRole());
        return new AuthResponse(userMapper.toDto(user), token);
    }

    @Transactional
    public AuthResponse signup(SignupRequest request) {
        if (userRepository.existsByEmailIgnoreCase(request.email())) {
            throw new ConflictException("Bu e-posta zaten kayıtlı");
        }
        OffsetDateTime now = OffsetDateTime.now();
        User user = User.builder()
                .name(request.name())
                .email(request.email().toLowerCase())
                .passwordHash(passwordEncoder.encode(request.password()))
                .role(UserRole.USER)
                .createdAt(now)
                .updatedAt(now)
                .build();
        user = userRepository.save(user);
        String token = jwtUtil.generateToken(user.getId(), user.getRole());
        return new AuthResponse(userMapper.toDto(user), token);
    }

    @Transactional
    public UserDTO updateProfile(Long userId, ProfileUpdateRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new NotFoundException("Kullanıcı bulunamadı"));
        if (!user.getEmail().equalsIgnoreCase(request.email())
                && userRepository.existsByEmailIgnoreCase(request.email())) {
            throw new ConflictException("Bu e-posta zaten kayıtlı");
        }
        user.setName(request.name());
        user.setEmail(request.email().toLowerCase());
        user.setUpdatedAt(OffsetDateTime.now());
        return userMapper.toDto(user);
    }

    @Transactional
    public void changePassword(Long userId, PasswordChangeRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new NotFoundException("Kullanıcı bulunamadı"));
        if (!passwordEncoder.matches(request.currentPassword(), user.getPasswordHash())) {
            throw new BadRequestException("Mevcut şifre yanlış");
        }
        if (!request.newPassword().equals(request.confirmPassword())) {
            throw new BadRequestException("Yeni şifreler eşleşmiyor");
        }
        user.setPasswordHash(passwordEncoder.encode(request.newPassword()));
        user.setUpdatedAt(OffsetDateTime.now());
    }

    @Transactional(readOnly = true)
    public UserDTO currentUser(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new NotFoundException("Kullanıcı bulunamadı"));
        return userMapper.toDto(user);
    }

    @Transactional
    public UserDTO updateAvatarUrl(Long userId, String avatarUrl) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new NotFoundException("Kullanıcı bulunamadı"));
        user.setAvatarUrl(avatarUrl);
        user.setUpdatedAt(OffsetDateTime.now());
        // Sync avatar to Creator entity so creator profiles reflect the new photo
        creatorRepository.findById(userId).ifPresent(creator -> {
            creator.setAvatar(avatarUrl);
            creatorRepository.save(creator);
        });
        return userMapper.toDto(user);
    }

    @Transactional
    public UserDTO updateFavoriteCategory(Long userId, String category) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new NotFoundException("Kullanıcı bulunamadı"));
        user.setFavoriteCategory(category);
        user.setUpdatedAt(OffsetDateTime.now());
        return userMapper.toDto(user);
    }

    /**
     * Generates a password-reset token and logs the link to console.
     * Silently succeeds for unknown emails to prevent email enumeration.
     */
    @Transactional(readOnly = true)
    public void forgotPassword(String email) {
        userRepository.findByEmailIgnoreCase(email).ifPresent(user -> {
            String token = UUID.randomUUID().toString();
            passwordResetTokens.put(token, user.getId());
            log.info("================================================");
            log.info("[DEV] Şifre sıfırlama bağlantısı oluşturuldu");
            log.info("[DEV] Kullanıcı : {} ({})", user.getName(), user.getEmail());
            log.info("[DEV] Token     : {}", token);
            log.info("[DEV] Bağlantı  : http://localhost:5173/reset-password?token={}", token);
            log.info("================================================");
        });
    }
}
