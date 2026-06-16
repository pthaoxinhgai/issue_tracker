package com.issuetracker.backend.service;

import com.issuetracker.backend.domain.entity.User;
import com.issuetracker.backend.dto.request.AuthRequest;
import com.issuetracker.backend.dto.response.AuthResponse;
import com.issuetracker.backend.dto.request.RegisterRequest;
import com.issuetracker.backend.dto.response.UserDto;

import java.util.List;

public interface UserService {
    AuthResponse register(RegisterRequest request);
    AuthResponse login(AuthRequest request);
    UserDto mapToDto(User user);
    List<UserDto> getAllUsers();
    UserDto changeRole(Long userId, com.issuetracker.backend.domain.enums.Role newRole);
}
