package com.sochen.controller;

import com.sochen.dto.request.CreatorProfileUpdateRequest;
import com.sochen.dto.request.FavoriteCategoryRequest;
import com.sochen.dto.request.PasswordChangeRequest;
import com.sochen.dto.request.ProfileUpdateRequest;
import com.sochen.dto.response.FollowedCreatorDTO;
import com.sochen.dto.response.LikedContentDTO;
import com.sochen.dto.response.NotificationDTO;
import com.sochen.dto.response.UserDTO;
import com.sochen.exception.BadRequestException;
import com.sochen.security.AuthenticationFacade;
import com.sochen.service.AuthService;
import com.sochen.service.ContentService;
import com.sochen.service.CreatorService;
import jakarta.validation.Valid;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Path;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final AuthService authService;
    private final ContentService contentService;
    private final CreatorService creatorService;
    private final AuthenticationFacade authFacade;
    private final Path uploadRoot;

    public UserController(AuthService authService,
                          ContentService contentService,
                          CreatorService creatorService,
                          AuthenticationFacade authFacade,
                          Path uploadRoot) {
        this.authService = authService;
        this.contentService = contentService;
        this.creatorService = creatorService;
        this.authFacade = authFacade;
        this.uploadRoot = uploadRoot;
    }

    @PutMapping("/me")
    public ResponseEntity<UserDTO> updateProfile(@Valid @RequestBody ProfileUpdateRequest request) {
        return ResponseEntity.ok(authService.updateProfile(authFacade.currentUserId(), request));
    }

    @PutMapping("/me/password")
    public ResponseEntity<Void> changePassword(@Valid @RequestBody PasswordChangeRequest request) {
        authService.changePassword(authFacade.currentUserId(), request);
        return ResponseEntity.noContent().build();
    }

    @PostMapping(value = "/me/avatar", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<UserDTO> uploadAvatar(@RequestParam("file") MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new BadRequestException("Dosya boş olamaz");
        }
        try {
            String originalName = file.getOriginalFilename();
            String ext = (originalName != null && originalName.contains("."))
                    ? originalName.substring(originalName.lastIndexOf('.'))
                    : ".jpg";
            String filename = "avatar_" + authFacade.currentUserId()
                    + "_" + UUID.randomUUID().toString().replace("-", "").substring(0, 8) + ext;
            file.transferTo(uploadRoot.resolve(filename));
            String url = "/uploads/" + filename;
            return ResponseEntity.ok(authService.updateAvatarUrl(authFacade.currentUserId(), url));
        } catch (IOException ex) {
            throw new BadRequestException("Fotoğraf yüklenemedi: " + ex.getMessage());
        }
    }

    @GetMapping("/me/likes")
    public ResponseEntity<List<LikedContentDTO>> likes() {
        return ResponseEntity.ok(contentService.listLikedContent(authFacade.currentUserId()));
    }

    @GetMapping("/me/following")
    public ResponseEntity<List<FollowedCreatorDTO>> following() {
        return ResponseEntity.ok(creatorService.listFollowed(authFacade.currentUserId()));
    }

    @GetMapping("/me/notifications")
    public ResponseEntity<List<NotificationDTO>> notifications() {
        return ResponseEntity.ok(creatorService.getNotifications(authFacade.currentUserId()));
    }

    @PutMapping("/me/creator-profile")
    public ResponseEntity<Void> updateCreatorProfile(@Valid @RequestBody CreatorProfileUpdateRequest request) {
        creatorService.updateCreatorProfile(authFacade.currentUserId(), request.bio(), request.type());
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/me/favorite-category")
    public ResponseEntity<UserDTO> updateFavoriteCategory(@Valid @RequestBody FavoriteCategoryRequest request) {
        return ResponseEntity.ok(authService.updateFavoriteCategory(authFacade.currentUserId(), request.category()));
    }
}
