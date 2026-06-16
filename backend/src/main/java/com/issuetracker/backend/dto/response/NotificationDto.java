package com.issuetracker.backend.dto.response;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class NotificationDto {
    private Long id;
    private String message;
    private Long issueId;
    private Boolean isRead;
    private LocalDateTime createdAt;
}
