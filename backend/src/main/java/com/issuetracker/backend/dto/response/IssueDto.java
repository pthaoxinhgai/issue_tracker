package com.issuetracker.backend.dto.response;

import com.issuetracker.backend.domain.enums.IssueStatus;
import com.issuetracker.backend.domain.enums.IssueType;
import com.issuetracker.backend.domain.enums.Priority;
import com.issuetracker.backend.domain.enums.Severity;
import lombok.Builder;
import lombok.Data;
import java.time.LocalDateTime;

import java.util.Set;

@Data
@Builder
public class IssueDto {
    private Long id;
    private String title;
    private String description;
    private IssueType type;
    private IssueStatus status;
    private Priority priority;
    private Severity severity;
    private ProjectDto project;
    private Long projectId;
    private UserDto assignee;
    private UserDto creator;
    private Long problemReportId;
    private String customerEmail;
    private String attachmentLink;
    private Integer duplicateCount;
    private Set<String> labels;
    private LocalDateTime dueDate;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
