package com.issuetracker.backend.dto;

import com.issuetracker.backend.domain.enums.IssueStatus;
import com.issuetracker.backend.domain.enums.IssueType;
import com.issuetracker.backend.domain.enums.Priority;
import lombok.Builder;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@Builder
public class IssueDto {
    private Long id;
    private String title;
    private String description;
    private IssueType type;
    private IssueStatus status;
    private Priority priority;
    private UserDto assignee;
    private UserDto reporter;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
