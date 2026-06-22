package com.issuetracker.backend.service;

import com.issuetracker.backend.dto.response.CommentDto;
import java.util.List;

public interface CommentService {
    List<CommentDto> getCommentsByIssue(Long issueId);
    List<CommentDto> getCommentsByReport(Long reportId);
    CommentDto addComment(Long issueId, String content, boolean isInternal);
    CommentDto addReportComment(Long reportId, String content);
}
