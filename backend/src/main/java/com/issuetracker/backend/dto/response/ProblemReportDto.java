package com.issuetracker.backend.dto.response;

import com.issuetracker.backend.domain.enums.ReportStatus;
import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProblemReportDto {
    private Long id;
    private String title;
    private String description;
    private ReportStatus status;
    private UserDto reporter;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
