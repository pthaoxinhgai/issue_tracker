package com.issuetracker.backend.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ProblemReportRequest {

    @NotBlank(message = "Title is required")
    private String title;

    private String description;
}
