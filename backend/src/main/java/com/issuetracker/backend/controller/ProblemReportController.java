package com.issuetracker.backend.controller;

import com.issuetracker.backend.domain.enums.ReportStatus;
import com.issuetracker.backend.dto.request.ProblemReportRequest;
import com.issuetracker.backend.dto.response.ActivityLogDto;
import com.issuetracker.backend.dto.response.CommentDto;
import com.issuetracker.backend.dto.response.IssueDto;
import com.issuetracker.backend.dto.response.ProblemReportDto;
import com.issuetracker.backend.service.ActivityLogService;
import com.issuetracker.backend.service.CommentService;
import com.issuetracker.backend.service.IssueService;
import com.issuetracker.backend.service.ProblemReportService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/reports")
@RequiredArgsConstructor
public class ProblemReportController {

    private final ProblemReportService problemReportService;
    private final CommentService commentService;
    private final ActivityLogService activityLogService;
    private final IssueService issueService; // In case we need to list issues for a report later

    @PostMapping
    @PreAuthorize("hasRole('SUPPORT_STAFF')")
    public ResponseEntity<ProblemReportDto> createReport(@Valid @RequestBody ProblemReportRequest request) {
        return ResponseEntity.ok(problemReportService.createReport(request));
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN')")
    public ResponseEntity<List<ProblemReportDto>> getAllReports() {
        return ResponseEntity.ok(problemReportService.getAllReports());
    }

    @GetMapping("/my")
    @PreAuthorize("hasAnyRole('SUPPORT_STAFF')")
    public ResponseEntity<List<ProblemReportDto>> getMyReports() {
        return ResponseEntity.ok(problemReportService.getMyReports());
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('SUPPORT_STAFF', 'ADMIN', 'PRODUCT_OWNER', 'ENGINEERING_MANAGER', 'DEVELOPER', 'QA')")
    public ResponseEntity<ProblemReportDto> getReportById(@PathVariable Long id) {
        // Simple security check could be added inside service to ensure REPORTER only gets their own report
        return ResponseEntity.ok(problemReportService.getReportById(id));
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ProblemReportDto> changeStatus(@PathVariable Long id, @RequestParam ReportStatus newStatus) {
        return ResponseEntity.ok(problemReportService.changeStatus(id, newStatus));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteReport(@PathVariable Long id) {
        problemReportService.deleteReport(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{id}/issues")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<IssueDto> createIssueFromReport(@PathVariable Long id, @RequestBody IssueDto request) {
        request.setProblemReportId(id);
        return ResponseEntity.ok(issueService.createIssue(request));
    }

    // Comments routes
    @GetMapping("/{id}/comments")
    @PreAuthorize("hasAnyRole('SUPPORT_STAFF', 'ADMIN', 'PRODUCT_OWNER', 'ENGINEERING_MANAGER', 'DEVELOPER', 'QA')")
    public ResponseEntity<List<CommentDto>> getComments(@PathVariable Long id) {
        return ResponseEntity.ok(commentService.getCommentsByReport(id));
    }

    @PostMapping("/{id}/comments")
    @PreAuthorize("hasAnyRole('SUPPORT_STAFF', 'ADMIN', 'PRODUCT_OWNER', 'ENGINEERING_MANAGER', 'DEVELOPER', 'QA')")
    public ResponseEntity<CommentDto> addComment(@PathVariable Long id, @RequestBody CommentDto request) {
        return ResponseEntity.ok(commentService.addReportComment(id, request.getContent()));
    }

    // Activity log routes
    @GetMapping("/{id}/activities")
    @PreAuthorize("hasAnyRole('SUPPORT_STAFF', 'ADMIN', 'PRODUCT_OWNER', 'ENGINEERING_MANAGER', 'DEVELOPER', 'QA')")
    public ResponseEntity<List<ActivityLogDto>> getActivities(@PathVariable Long id) {
        return ResponseEntity.ok(activityLogService.getActivitiesByReport(id));
    }
}
