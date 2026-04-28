package com.example.demo.controller;

import com.example.demo.dto.UserDashboardDTO;
import com.example.demo.service.DashboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/dashboard")
@RequiredArgsConstructor
public class DashboardController {
    private final DashboardService dashboardService;

    /**
     * Figma User Dashboard ekranındaki tüm dinamik verileri oturumdaki kullanıcı için döner.
     */
    @GetMapping("/me")
    public UserDashboardDTO getMyDashboard(Authentication authentication) {
        return dashboardService.getDashboardByUsername(authentication.getName());
    }
}
