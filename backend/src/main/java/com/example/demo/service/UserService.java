package com.example.demo.service;

import com.example.demo.dto.UserDTO;
import com.example.demo.entity.User;
import com.example.demo.exception.ResourceNotFoundException;
import com.example.demo.mapper.DtoMapper;
import com.example.demo.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class UserService implements UserDetailsService {
    private final UserRepository userRepository;
    private final DtoMapper mapper;

    @Override
    /**
     * JWT doğrulaması sırasında kullanıcı detayını kullanıcı adına göre getirir.
     */
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("Kullanıcı adı bulunamadı: " + username));
    }

    /**
     * Figma kullanıcı liste görünümünde kullanılacak tüm kullanıcı DTO'larını döner.
     */
    public List<UserDTO> getAllUsers() {
        return userRepository.findAll().stream().map(mapper::toUserDto).toList();
    }

    /**
     * Figma profil detayında gösterilecek tek kullanıcı bilgisini döner.
     */
    public UserDTO getUserById(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User bulunamadı. id=" + id));
        return mapper.toUserDto(user);
    }
}
