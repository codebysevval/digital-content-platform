package com.example.demo.service;

import com.example.demo.dto.ContentDTO;
import com.example.demo.dto.ContentUpsertRequest;
import com.example.demo.entity.Content;
import com.example.demo.exception.ResourceNotFoundException;
import com.example.demo.mapper.DtoMapper;
import com.example.demo.repository.ContentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ContentService {

    private final ContentRepository contentRepository;
    private final DtoMapper mapper;

    /**
     * Figma dashboard içerik listesi kartlarını göstermek için tüm içerikleri döner.
     */
    public List<ContentDTO> getAllContents() {
        return contentRepository.findAll().stream().map(mapper::toContentDto).toList();
    }

    /**
     * Figma içerik detay alanı için tekil içerik kaydını getirir.
     */
    public ContentDTO getContentById(Long id) {
        Content content = contentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("İçerik bulunamadı. id=" + id));
        return mapper.toContentDto(content);
    }

    /**
     * Figma yönetici panelindeki "İçerik ekle" aksiyonunu gerçekleştirir.
     */
    public ContentDTO createContent(ContentUpsertRequest request) {
        Content content = new Content();
        content.setTitle(request.getTitle());
        content.setCategory(request.getCategory());
        content.setThumbnailUrl(request.getThumbnailUrl());
        content.setDurationMinutes(request.getDurationMinutes());
        content.setPremium(request.isPremium());
        return mapper.toContentDto(contentRepository.save(content));
    }

    /**
     * Figma yönetici panelindeki "İçerik sil" aksiyonunu gerçekleştirir.
     */
    public void deleteContent(Long id) {
        Content content = contentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Silinecek içerik bulunamadı. id=" + id));
        contentRepository.delete(content);
    }
}
