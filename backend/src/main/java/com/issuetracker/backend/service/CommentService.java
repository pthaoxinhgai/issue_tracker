package com.issuetracker.backend.service;

import com.issuetracker.backend.domain.entity.Comment;
import com.issuetracker.backend.domain.entity.Issue;
import com.issuetracker.backend.domain.entity.User;
import com.issuetracker.backend.dto.CommentDto;
import com.issuetracker.backend.repository.CommentRepository;
import com.issuetracker.backend.repository.IssueRepository;
import com.issuetracker.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CommentService {

    private final CommentRepository commentRepository;
    private final IssueRepository issueRepository;
    private final UserRepository userRepository;
    private final UserService userService;

    public List<CommentDto> getCommentsByIssue(Long issueId) {
        return commentRepository.findByIssueIdOrderByCreatedAtAsc(issueId).stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    public CommentDto addComment(Long issueId, Long userId, String content) {
        Issue issue = issueRepository.findById(issueId)
                .orElseThrow(() -> new RuntimeException("Issue not found"));
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Comment comment = Comment.builder()
                .issue(issue)
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
                .createdAt(comment.getCreatedAt())
                .build();
    }
}
