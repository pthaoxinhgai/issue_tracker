package com.issuetracker.backend.dto.request;

import com.issuetracker.backend.domain.enums.Role;
import lombok.Data;

@Data
public class UserUpdateRequest {
    private String name;
    private String email;
    private String password;
    private Role role;
}
