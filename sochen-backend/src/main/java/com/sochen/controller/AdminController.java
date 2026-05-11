package com.sochen.controller;

import com.sochen.dto.request.ChangeRoleRequest;
import com.sochen.dto.request.ContentRejectionRequest;
import com.sochen.dto.request.GrantSubscriptionRequest;
import com.sochen.dto.request.SimulateTrafficRequest;
import com.sochen.dto.response.AdminStatsDTO;
import com.sochen.dto.response.AdminUserItemDTO;
import com.sochen.dto.response.DistributionRegionDTO;
import com.sochen.dto.response.DistributionStatsDTO;
import com.sochen.dto.response.FinancialDataPointDTO;
import com.sochen.dto.response.ManagedUserDTO;
import com.sochen.dto.response.PendingContentDTO;
import com.sochen.dto.response.RevenueDataPointDTO;
import com.sochen.dto.response.SystemModuleDTO;
import com.sochen.dto.response.WeeklyDeliveryDayDTO;
import com.sochen.service.AdminService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/admin")
public class AdminController {

    private final AdminService adminService;

    public AdminController(AdminService adminService) {
        this.adminService = adminService;
    }

    @GetMapping("/content/pending")
    public ResponseEntity<List<PendingContentDTO>> pending() {
        return ResponseEntity.ok(adminService.listPending());
    }

    @PostMapping("/content/{id}/approve")
    public ResponseEntity<Void> approve(@PathVariable Long id) {
        adminService.approve(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/content/{id}/reject")
    public ResponseEntity<Void> reject(@PathVariable Long id,
                                       @Valid @RequestBody ContentRejectionRequest request) {
        adminService.reject(id, request.reason());
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/stats")
    public ResponseEntity<AdminStatsDTO> stats() {
        return ResponseEntity.ok(adminService.getStats());
    }

    @GetMapping("/analytics/financial")
    public ResponseEntity<List<FinancialDataPointDTO>> financial() {
        return ResponseEntity.ok(adminService.getFinancialSeries());
    }

    @GetMapping("/analytics/revenue")
    public ResponseEntity<List<RevenueDataPointDTO>> revenue() {
        return ResponseEntity.ok(adminService.getRevenueSeries());
    }

    @GetMapping("/users")
    public ResponseEntity<List<ManagedUserDTO>> users(
            @RequestParam(value = "context", required = false) String context) {
        return ResponseEntity.ok(adminService.listManagedUsers(context));
    }

    @GetMapping("/system/modules")
    public ResponseEntity<List<SystemModuleDTO>> modules() {
        return ResponseEntity.ok(adminService.listSystemModules());
    }

    @GetMapping("/distribution/regions")
    public ResponseEntity<List<DistributionRegionDTO>> regions() {
        return ResponseEntity.ok(adminService.listDistributionRegions());
    }

    @GetMapping("/distribution/stats")
    public ResponseEntity<DistributionStatsDTO> distributionStats() {
        return ResponseEntity.ok(adminService.getDistributionStats());
    }

    @GetMapping("/distribution/weekly")
    public ResponseEntity<List<WeeklyDeliveryDayDTO>> weekly() {
        return ResponseEntity.ok(adminService.listWeeklyDeliveries());
    }

    // ── Geliştirici Araçları ──────────────────────────────────────────────────

    @GetMapping("/dev/users")
    public ResponseEntity<List<AdminUserItemDTO>> allUsers() {
        return ResponseEntity.ok(adminService.listAllUsers());
    }

    @PutMapping("/dev/users/{id}/role")
    public ResponseEntity<Void> changeRole(@PathVariable Long id,
                                           @Valid @RequestBody ChangeRoleRequest request) {
        adminService.changeUserRole(id, request.role());
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/dev/users/{id}/grant-subscription")
    public ResponseEntity<Void> grantSubscription(@PathVariable Long id,
                                                  @Valid @RequestBody GrantSubscriptionRequest request) {
        adminService.grantSubscription(id, request.planId(), request.months());
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/dev/content/{id}/simulate-traffic")
    public ResponseEntity<Void> simulateTraffic(@PathVariable Long id,
                                                @Valid @RequestBody SimulateTrafficRequest request) {
        adminService.simulateTraffic(id, request.views(), request.likes());
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/dev/users/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteUser(@PathVariable Long id) {
        adminService.deleteUser(id);
    }

    @DeleteMapping("/dev/content/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteContent(@PathVariable Long id) {
        adminService.deleteContent(id);
    }
}
