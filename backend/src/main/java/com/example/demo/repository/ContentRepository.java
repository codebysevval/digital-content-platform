package com.example.demo.repository;

import com.example.demo.entity.Content;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface ContentRepository extends JpaRepository<Content, Long> {
    @Query("select c from Content c join c.users u where u.id = :userId")
    List<Content> findAllAccessibleByUserId(Long userId);

    @Query("select count(c) from Content c join c.users u where u.id = :userId")
    long countAccessibleByUserId(Long userId);

    @Query("select count(c) from Content c join c.users u where u.id = :userId and c.premium = true")
    long countPremiumAccessibleByUserId(Long userId);

    @Query("select distinct c.category from Content c join c.users u where u.id = :userId")
    List<String> findDistinctCategoriesByUserId(Long userId);
}
