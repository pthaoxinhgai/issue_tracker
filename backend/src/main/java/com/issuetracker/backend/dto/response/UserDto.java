package com.issuetracker.backend.dto.response;

import com.issuetracker.backend.domain.enums.Role;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class UserDto {
    private Long id;
    private String name;
    private String email;
    private Role role;
}
