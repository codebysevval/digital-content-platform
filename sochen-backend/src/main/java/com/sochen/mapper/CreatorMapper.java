package com.sochen.mapper;

import com.sochen.domain.Creator;
import com.sochen.dto.response.CreatorDTO;
import com.sochen.dto.response.FollowedCreatorDTO;
import com.sochen.util.DisplayFormatter;
import org.springframework.stereotype.Component;

@Component
public class CreatorMapper {

    public CreatorDTO toDto(Creator c) {
        return new CreatorDTO(
                c.getId(),
                c.getName(),
                c.getAvatar(),
                c.getType(),
                c.getBio(),
                c.getFollowers(),
                c.getTotalContent(),
                c.getTotalViews()
        );
    }

    public FollowedCreatorDTO toFollowedDto(Creator c) {
        return new FollowedCreatorDTO(
                c.getId(),
                c.getName(),
                c.getAvatar(),
                DisplayFormatter.formatFollowedCreatorCount(c.getFollowers())
        );
    }
}
