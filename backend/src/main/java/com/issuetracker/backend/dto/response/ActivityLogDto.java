package com.issuetracker.backend.dto.response;

import com.issuetracker.backend.domain.enums.ActivityAction;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class ActivityLogDto {
    private Long id;
    private Long issueId;
    private Long problemReportId;
    private UserDto user;
    private ActivityAction action;
    private String oldValue;
    private String newValue;
    private LocalDateTime createdAt;
}
