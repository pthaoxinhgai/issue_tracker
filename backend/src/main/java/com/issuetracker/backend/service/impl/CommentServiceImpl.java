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
import com.issuetracker.backend.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.regex.Matcher;
import java.util.regex.Pattern;

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
    private final NotificationService notificationService;
    private final com.issuetracker.backend.service.ActivityLogService activityLogService;

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

    public CommentDto addComment(Long issueId, String content, boolean isInternal) {
        Issue issue = issueRepository.findById(issueId)
                .orElseThrow(() -> new RuntimeException("Issue not found"));
        
        String email = com.issuetracker.backend.security.SecurityUtils.getCurrentUserEmail();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Comment comment = Comment.builder()
                .issue(issue)
                .user(user)
                .content(content)
                .isInternal(isInternal)
                .build();

        comment = commentRepository.save(comment);
        activityLogService.logActivity(issue, user, com.issuetracker.backend.domain.enums.ActivityAction.COMMENT_ADD, null, "Added a comment");

        // Mention Logic
        Pattern pattern = Pattern.compile("@([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,})");
        Matcher matcher = pattern.matcher(content);
        boolean assigneeMentioned = false;
        while (matcher.find()) {
            String mentionedEmail = matcher.group(1);
            userRepository.findByEmail(mentionedEmail).ifPresent(mentionedUser -> {
                if (!mentionedUser.getId().equals(user.getId())) {
                    notificationService.createNotification(
                        mentionedUser, 
                        user.getName() + " mentioned you in Issue #" + issue.getId(), 
                        issue.getId()
                    );
                }
            });
            if (issue.getAssignee() != null && issue.getAssignee().getEmail().equals(mentionedEmail)) {
                assigneeMentioned = true;
            }
        }

        // Notify Assignee if they are not the commenter and were not explicitly mentioned
        if (issue.getAssignee() != null && !issue.getAssignee().getId().equals(user.getId()) && !assigneeMentioned) {
            notificationService.createNotification(
                issue.getAssignee(), 
                user.getName() + " commented on your assigned Issue #" + issue.getId(), 
                issue.getId()
            );
        }

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
                .isInternal(comment.isInternal())
                .createdAt(comment.getCreatedAt())
                .build();
    }
}
