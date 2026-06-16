package com.issuetracker.backend.repository;

import com.issuetracker.backend.domain.entity.Comment;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CommentRepository extends JpaRepository<Comment, Long> {
    List<Comment> findByIssueIdOrderByCreatedAtAsc(Long issueId);
    List<Comment> findByProblemReportIdOrderByCreatedAtAsc(Long problemReportId);
}
