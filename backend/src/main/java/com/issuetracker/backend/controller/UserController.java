package com.issuetracker.backend.controller;

import com.issuetracker.backend.dto.response.UserDto;
import com.issuetracker.backend.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @PreAuthorize("hasRole('MAINTAINER')")
    @GetMapping
    public ResponseEntity<List<UserDto>> getAllUsers() {
        return ResponseEntity.ok(userService.getAllUsers());
    }

    @PreAuthorize("hasRole('MAINTAINER')")
    @org.springframework.web.bind.annotation.PutMapping("/{id}/role")
    public ResponseEntity<UserDto> changeRole(
            @org.springframework.web.bind.annotation.PathVariable Long id,
            @org.springframework.web.bind.annotation.RequestParam com.issuetracker.backend.domain.enums.Role role) {
        return ResponseEntity.ok(userService.changeRole(id, role));
    }
}
