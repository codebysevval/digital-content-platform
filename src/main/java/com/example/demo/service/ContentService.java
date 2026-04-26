package com.example.demo.service;

import com.example.demo.dto.ContentDTO;
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

    public List<ContentDTO> getAllContents() {
        // TODO: Gelişmiş içerik filtreleme (kategori, etiket, fiyat aralığı) eklenecek.
        return contentRepository.findAll().stream().map(mapper::toContentDto).toList();
    }

    public ContentDTO getContentById(Long id) {
        Content content = contentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("İçerik bulunamadı. id=" + id));
        return mapper.toContentDto(content);
    }
}
