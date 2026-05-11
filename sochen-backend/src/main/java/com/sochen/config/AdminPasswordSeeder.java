package com.sochen.config;

import com.sochen.domain.User;
import com.sochen.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;

/**
 * Replaces any seeded password placeholder hash with a freshly-encoded
 * BCrypt hash for "demo123". The placeholder pattern is set by
 * V3__seed_reference_and_demo_data.sql so that the migration stays
 * deterministic while the password is hashed using the same encoder
 * configuration the rest of the app uses.
 *
 * Idempotent: subsequent runs find no placeholders and exit early.
 */
@Component
public class AdminPasswordSeeder implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(AdminPasswordSeeder.class);

    private static final String PLACEHOLDER = "__SEEDED_PASSWORD_PLACEHOLDER__";
    private static final String DEMO_PASSWORD = "demo123";

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public AdminPasswordSeeder(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    @Transactional
    public void run(String... args) {
        long replaced = userRepository.findAll().stream()
                .filter(u -> PLACEHOLDER.equals(u.getPasswordHash()))
                .peek(this::seedPassword)
                .count();
        if (replaced > 0) {
            log.info("AdminPasswordSeeder replaced {} placeholder password(s) with BCrypt-encoded value", replaced);
        }
    }

    private void seedPassword(User user) {
        user.setPasswordHash(passwordEncoder.encode(DEMO_PASSWORD));
        user.setUpdatedAt(OffsetDateTime.now());
        userRepository.save(user);
    }
}
