package com.issuetracker.backend.controller;

import com.issuetracker.backend.dto.response.ActivityLogDto;
import com.issuetracker.backend.dto.response.CommentDto;
import com.issuetracker.backend.dto.response.IssueDto;
import com.issuetracker.backend.service.ActivityLogService;
import com.issuetracker.backend.service.CommentService;
import com.issuetracker.backend.service.IssueService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.access.prepost.PreAuthorize;

import java.util.List;

@RestController
@RequestMapping("/api/issues")
@RequiredArgsConstructor
public class IssueController {

    private final IssueService issueService;
    private final CommentService commentService;
    private final com.issuetracker.backend.service.ActivityLogService activityLogService;
    private final com.issuetracker.backend.service.DashboardService dashboardService;

    @GetMapping("/dashboard/stats")
    @PreAuthorize("hasAnyRole('DEVELOPER', 'PRODUCT_OWNER', 'ENGINEERING_MANAGER', 'ADMIN')")
    public ResponseEntity<com.issuetracker.backend.dto.response.DashboardStatsDto> getDashboardStats() {
        return ResponseEntity.ok(dashboardService.getDashboardStats());
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('SUPPORT_STAFF', 'PRODUCT_OWNER', 'ENGINEERING_MANAGER', 'DEVELOPER', 'QA', 'ADMIN')")
    public ResponseEntity<List<IssueDto>> getAllIssues(
            @RequestParam(required = false) com.issuetracker.backend.domain.enums.IssueStatus status,
            @RequestParam(required = false) Long assigneeId,
            @RequestParam(required = false) com.issuetracker.backend.domain.enums.Priority priority
    ) {
        return ResponseEntity.ok(issueService.filterIssues(status, assigneeId, priority));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('SUPPORT_STAFF', 'PRODUCT_OWNER', 'ENGINEERING_MANAGER', 'DEVELOPER', 'QA', 'ADMIN')")
    public ResponseEntity<IssueDto> getIssueById(@PathVariable Long id) {
        return ResponseEntity.ok(issueService.getIssueById(id));
    }

    @PostMapping
    @PreAuthorize("hasRole('SUPPORT_STAFF')")
    public ResponseEntity<IssueDto> createIssue(@RequestBody IssueDto dto) {
        return ResponseEntity.ok(issueService.createIssue(dto));
    }

    @PutMapping("/{id}")
    @PreAuthorize("@issueSecurity.canUpdateIssue(authentication, #id)")
    public ResponseEntity<IssueDto> updateIssue(@PathVariable Long id, @RequestBody IssueDto dto) {
        return ResponseEntity.ok(issueService.updateIssue(id, dto));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteIssue(@PathVariable Long id) {
        issueService.deleteIssue(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{id}/assign/{userId}")
    @PreAuthorize("hasAnyRole('PRODUCT_OWNER', 'ENGINEERING_MANAGER')")
    public ResponseEntity<IssueDto> assignIssue(@PathVariable Long id, @PathVariable Long userId) {
        return ResponseEntity.ok(issueService.assignIssue(id, userId));
    }

    @PostMapping("/{id}/escalate")
    @PreAuthorize("hasRole('SUPPORT_STAFF')")
    public ResponseEntity<IssueDto> escalateIssue(
            @PathVariable Long id, 
            @RequestParam String reason, 
            @RequestParam String impactLevel, 
            @RequestParam String evidence) {
        return ResponseEntity.ok(issueService.escalateIssue(id, reason, impactLevel, evidence));
    }

    @PostMapping("/{id}/link/{targetId}")
    @PreAuthorize("hasAnyRole('SUPPORT_STAFF', 'PRODUCT_OWNER', 'ENGINEERING_MANAGER')")
    public ResponseEntity<IssueDto> linkIssues(
            @PathVariable Long id, 
            @PathVariable Long targetId, 
            @RequestParam String linkType) {
        return ResponseEntity.ok(issueService.linkIssues(id, targetId, linkType));
    }

    @PreAuthorize("@issueSecurity.canUpdateIssue(authentication, #id)")
    @PatchMapping("/{id}/status")
    public ResponseEntity<IssueDto> changeStatus(@PathVariable Long id, @RequestParam com.issuetracker.backend.domain.enums.IssueStatus newStatus) {
        return ResponseEntity.ok(issueService.changeStatus(id, newStatus));
    }

    @PostMapping("/{id}/labels")
    @PreAuthorize("@issueSecurity.canUpdateIssue(authentication, #id)")
    public ResponseEntity<IssueDto> addLabel(@PathVariable Long id, @RequestParam String label) {
        return ResponseEntity.ok(issueService.addLabel(id, label));
    }

    @DeleteMapping("/{id}/labels/{label}")
    @PreAuthorize("@issueSecurity.canUpdateIssue(authentication, #id)")
    public ResponseEntity<IssueDto> removeLabel(@PathVariable Long id, @PathVariable String label) {
        return ResponseEntity.ok(issueService.removeLabel(id, label));
    }

    // Comments routes
    @GetMapping("/{id}/comments")
    @PreAuthorize("hasAnyRole('SUPPORT_STAFF', 'PRODUCT_OWNER', 'ENGINEERING_MANAGER', 'DEVELOPER', 'QA', 'ADMIN')")
    public ResponseEntity<List<CommentDto>> getComments(@PathVariable Long id) {
        return ResponseEntity.ok(commentService.getCommentsByIssue(id));
    }

    @PostMapping("/{id}/comments")
    @PreAuthorize("hasAnyRole('SUPPORT_STAFF', 'PRODUCT_OWNER', 'ENGINEERING_MANAGER', 'DEVELOPER', 'QA', 'ADMIN')")
    public ResponseEntity<CommentDto> addComment(@PathVariable Long id, @RequestBody CommentDto request) {
        return ResponseEntity.ok(commentService.addComment(id, request.getContent(), request.isInternal()));
    }

    // Activity log routes
    @GetMapping("/{id}/activities")
    @PreAuthorize("hasAnyRole('SUPPORT_STAFF', 'PRODUCT_OWNER', 'ENGINEERING_MANAGER', 'DEVELOPER', 'QA', 'ADMIN')")
    public ResponseEntity<List<ActivityLogDto>> getActivities(@PathVariable Long id) {
        return ResponseEntity.ok(activityLogService.getActivitiesByIssue(id));
    }
    @GetMapping("/search")
    @PreAuthorize("hasAnyRole('SUPPORT_STAFF', 'PRODUCT_OWNER', 'ENGINEERING_MANAGER', 'DEVELOPER', 'QA', 'ADMIN')")
    public ResponseEntity<List<IssueDto>> searchIssues(@RequestParam String query) {
        return ResponseEntity.ok(issueService.searchIssues(query));
    }

    @PostMapping("/{id}/merge/{primaryId}")
    @PreAuthorize("hasAnyRole('SUPPORT_STAFF', 'PRODUCT_OWNER', 'ENGINEERING_MANAGER')")
    public ResponseEntity<IssueDto> mergeDuplicate(
            @PathVariable Long id, 
            @PathVariable Long primaryId) {
        return ResponseEntity.ok(issueService.mergeDuplicate(id, primaryId));
    }
}
