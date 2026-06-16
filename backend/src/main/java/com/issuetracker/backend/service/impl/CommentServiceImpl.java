package com.issuetracker.backend.service.impl;

import com.issuetracker.backend.domain.entity.Comment;
import com.issuetracker.backend.domain.entity.Issue;
import com.issuetracker.backend.domain.entity.User;
import com.issuetracker.backend.dto.response.CommentDto;
import com.issuetracker.backend.repository.CommentRepository;
import com.issuetracker.backend.repository.IssueRepository;
import com.issuetracker.backend.repository.UserRepository;
import com.issuetracker.backend.service.CommentService;
import com.issuetracker.backend.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CommentServiceImpl implements CommentService {

    private final CommentRepository commentRepository;
    private final IssueRepository issueRepository;
    private final com.issuetracker.backend.repository.ProblemReportRepository problemReportRepository;
    private final UserRepository userRepository;
    private final UserService userService;

    public List<CommentDto> getCommentsByIssue(Long issueId) {
        return commentRepository.findByIssueIdOrderByCreatedAtAsc(issueId).stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    public List<CommentDto> getCommentsByReport(Long reportId) {
        return commentRepository.findByProblemReportIdOrderByCreatedAtAsc(reportId).stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    public CommentDto addComment(Long issueId, String content) {
        Issue issue = issueRepository.findById(issueId)
                .orElseThrow(() -> new RuntimeException("Issue not found"));
        
        String email = com.issuetracker.backend.security.SecurityUtils.getCurrentUserEmail();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Comment comment = Comment.builder()
                .issue(issue)
                .user(user)
                .content(content)
                .build();

        comment = commentRepository.save(comment);
        return mapToDto(comment);
    }

    public CommentDto addReportComment(Long reportId, String content) {
        com.issuetracker.backend.domain.entity.ProblemReport report = problemReportRepository.findById(reportId)
                .orElseThrow(() -> new RuntimeException("Report not found"));
        
        String email = com.issuetracker.backend.security.SecurityUtils.getCurrentUserEmail();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Comment comment = Comment.builder()
                .problemReport(report)
                .user(user)
                .content(content)
                .build();

        comment = commentRepository.save(comment);
        return mapToDto(comment);
    }

    private CommentDto mapToDto(Comment comment) {
        return CommentDto.builder()
                .id(comment.getId())
                .content(comment.getContent())
                .user(userService.mapToDto(comment.getUser()))
                .issueId(comment.getIssue() != null ? comment.getIssue().getId() : null)
                .problemReportId(comment.getProblemReport() != null ? comment.getProblemReport().getId() : null)
                .createdAt(comment.getCreatedAt())
                .build();
    }
}
