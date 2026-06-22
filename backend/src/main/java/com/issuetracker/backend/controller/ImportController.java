package com.issuetracker.backend.controller;

import com.issuetracker.backend.domain.entity.User;
import com.issuetracker.backend.dto.response.ImportResultDto;
import com.issuetracker.backend.repository.UserRepository;
import com.issuetracker.backend.security.SecurityUtils;
import com.issuetracker.backend.service.ImportService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/issues")
@RequiredArgsConstructor
public class ImportController {

    private final ImportService importService;
    private final UserRepository userRepository;

    @PostMapping("/import")
    @PreAuthorize("hasAnyRole('SUPPORT_STAFF', 'ADMIN')")
    public ResponseEntity<ImportResultDto> importIssues(@RequestParam("file") MultipartFile file) {
        String email = SecurityUtils.getCurrentUserEmail();
        User currentUser = null;
        if (email != null) {
            currentUser = userRepository.findByEmail(email).orElse(null);
        }
        
        return ResponseEntity.ok(importService.importIssues(file, currentUser));
    }
}
