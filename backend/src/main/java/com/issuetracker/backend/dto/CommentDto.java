package com.issuetracker.backend.dto;

import lombok.Builder;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@Builder
public class CommentDto {
    private Long id;
    private String content;
    private UserDto user;
    private LocalDateTime createdAt;
}
