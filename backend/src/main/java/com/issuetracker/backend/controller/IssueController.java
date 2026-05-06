package com.issuetracker.backend.controller;

import com.issuetracker.backend.dto.CommentDto;
import com.issuetracker.backend.dto.IssueDto;
import com.issuetracker.backend.service.CommentService;
import com.issuetracker.backend.service.IssueService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/issues")
@RequiredArgsConstructor
public class IssueController {

    private final IssueService issueService;
    private final CommentService commentService;

    @GetMapping
    public ResponseEntity<List<IssueDto>> getAllIssues() {
        return ResponseEntity.ok(issueService.getAllIssues());
    }

    @GetMapping("/{id}")
    public ResponseEntity<IssueDto> getIssueById(@PathVariable Long id) {
        return ResponseEntity.ok(issueService.getIssueById(id));
    }

    @PostMapping
    public ResponseEntity<IssueDto> createIssue(@RequestBody IssueDto dto, @RequestHeader("X-User-Id") Long reporterId) {
        return ResponseEntity.ok(issueService.createIssue(dto, reporterId));
    }

    @PutMapping("/{id}")
    public ResponseEntity<IssueDto> updateIssue(@PathVariable Long id, @RequestBody IssueDto dto) {
        return ResponseEntity.ok(issueService.updateIssue(id, dto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteIssue(@PathVariable Long id) {
        issueService.deleteIssue(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{id}/assign/{userId}")
    public ResponseEntity<IssueDto> assignIssue(@PathVariable Long id, @PathVariable Long userId) {
        return ResponseEntity.ok(issueService.assignIssue(id, userId));
    }

    // Comments routes
    @GetMapping("/{id}/comments")
    public ResponseEntity<List<CommentDto>> getComments(@PathVariable Long id) {
        return ResponseEntity.ok(commentService.getCommentsByIssue(id));
    }

    @PostMapping("/{id}/comments")
    public ResponseEntity<CommentDto> addComment(@PathVariable Long id, @RequestBody CommentDto request, @RequestHeader("X-User-Id") Long userId) {
        return ResponseEntity.ok(commentService.addComment(id, userId, request.getContent()));
    }
}
