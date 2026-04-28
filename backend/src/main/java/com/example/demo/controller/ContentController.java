package com.example.demo.controller;

import com.example.demo.dto.ContentDTO;
import com.example.demo.dto.ContentUpsertRequest;
import com.example.demo.service.ContentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/contents")
@RequiredArgsConstructor
public class ContentController {

    private final ContentService contentService;

    /**
     * Figma dashboard içerik listesi alanını beslemek için tüm içerikleri döner.
     */
    @GetMapping
    public List<ContentDTO> getAllContents() {
        return contentService.getAllContents();
    }

    /**
     * Figma içerik detay görünümünde seçilen kartın verisini döner.
     */
    @GetMapping("/{id}")
    public ContentDTO getContentById(@PathVariable Long id) {
        return contentService.getContentById(id);
    }

    /**
     * Figma dashboard yönetici ekranındaki içerik ekleme formunun backend karşılığıdır.
     */
    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    @ResponseStatus(HttpStatus.CREATED)
    public ContentDTO createContent(@Valid @RequestBody ContentUpsertRequest request) {
        return contentService.createContent(request);
    }

    /**
     * Figma dashboard yönetici ekranındaki içerik silme aksiyonunun backend karşılığıdır.
     */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteContent(@PathVariable Long id) {
        contentService.deleteContent(id);
    }
}
