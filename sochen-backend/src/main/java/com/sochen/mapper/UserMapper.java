package com.sochen.mapper;

import com.sochen.domain.User;
import com.sochen.dto.response.UserDTO;
import com.sochen.util.DisplayFormatter;
import org.springframework.stereotype.Component;

@Component
public class UserMapper {

    public UserDTO toDto(User user) {
        return new UserDTO(
                user.getId(),
                user.getName(),
                user.getEmail(),
                DisplayFormatter.avatarInitials(user.getName()),
                user.getRole(),
                user.getAvatarUrl(),
                user.getFavoriteCategory()
        );
    }
}
