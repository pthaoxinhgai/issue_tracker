package com.issuetracker.backend.dto.response;

import lombok.Builder;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@Builder
public class CommentDto {
    private Long id;
    private String content;
    private UserDto user;
    private Long issueId;
    private Long problemReportId;
    private LocalDateTime createdAt;
}
