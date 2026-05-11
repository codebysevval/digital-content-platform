package com.sochen.security;

import com.sochen.exception.BadRequestException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

@Component
public class AuthenticationFacade {

    public CustomUserDetails currentUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated() || !(auth.getPrincipal() instanceof CustomUserDetails details)) {
            throw new BadRequestException("Yetkilendirme gerekli");
        }
        return details;
    }

    public Long currentUserId() {
        return currentUser().getId();
    }
}
