package com.issuetracker.backend.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AttachmentDto {
    private Long id;
    private String fileName;
    private String fileType;
    private String fileUrl;
    private Long issueId;
    private UserDto uploadedBy;
    private LocalDateTime createdAt;
}
