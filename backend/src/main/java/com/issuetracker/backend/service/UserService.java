package com.issuetracker.backend.service;

import com.issuetracker.backend.domain.entity.User;
import com.issuetracker.backend.domain.enums.Role;
import com.issuetracker.backend.dto.AuthRequest;
import com.issuetracker.backend.dto.AuthResponse;
import com.issuetracker.backend.dto.RegisterRequest;
import com.issuetracker.backend.dto.UserDto;
import com.issuetracker.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;

    public AuthResponse register(RegisterRequest request) {
        if (userRepository.findByEmail(request.getEmail()).isPresent()) {
            throw new RuntimeException("Email already exists");
        }

        User user = User.builder()
                .name(request.getName())
                .email(request.getEmail())
                .password(request.getPassword()) // No hashing for this simple project
                .role(Role.MEMBER)
                .build();

        user = userRepository.save(user);

        return AuthResponse.builder()
                .token("dummy-jwt-token-" + user.getId())
                .user(mapToDto(user))
                .build();
    }

    public AuthResponse login(AuthRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("Invalid email or password"));

        if (!user.getPassword().equals(request.getPassword())) {
            throw new RuntimeException("Invalid email or password");
        }

        return AuthResponse.builder()
                .token("dummy-jwt-token-" + user.getId())
                .user(mapToDto(user))
                .build();
    }
    
    public UserDto mapToDto(User user) {
        if (user == null) return null;
        return UserDto.builder()
                .id(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .role(user.getRole())
                .build();
    }

    public List<UserDto> getAllUsers() {
        return userRepository.findAll().stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }
}
