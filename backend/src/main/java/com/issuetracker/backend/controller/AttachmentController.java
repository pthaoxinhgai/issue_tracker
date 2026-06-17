package com.issuetracker.backend.controller;

import com.issuetracker.backend.domain.entity.User;
import com.issuetracker.backend.dto.response.AttachmentDto;
import com.issuetracker.backend.repository.UserRepository;
import com.issuetracker.backend.security.SecurityUtils;
import com.issuetracker.backend.service.AttachmentService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class AttachmentController {

    private final AttachmentService attachmentService;
    private final UserRepository userRepository;

    @PostMapping("/issues/{issueId}/attachments")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<AttachmentDto> uploadAttachment(@PathVariable Long issueId, @RequestParam("file") MultipartFile file) {
        String email = SecurityUtils.getCurrentUserEmail();
        User currentUser = userRepository.findByEmail(email).orElseThrow(() -> new RuntimeException("User not found"));
        return ResponseEntity.ok(attachmentService.uploadAttachment(issueId, file, currentUser));
    }

    @GetMapping("/issues/{issueId}/attachments")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<AttachmentDto>> getAttachments(@PathVariable Long issueId) {
        return ResponseEntity.ok(attachmentService.getAttachmentsByIssue(issueId));
    }

    @GetMapping("/attachments/{fileName:.+}")
    public ResponseEntity<Resource> downloadFile(@PathVariable String fileName, HttpServletRequest request) {
        Resource resource = attachmentService.loadFileAsResource(fileName);
        
        String contentType;
        try {
            contentType = request.getServletContext().getMimeType(resource.getFile().getAbsolutePath());
        } catch (Exception ex) {
            contentType = "application/octet-stream";
        }
        if(contentType == null) {
            contentType = "application/octet-stream";
        }

        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(contentType))
                .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + resource.getFilename() + "\"")
                .body(resource);
    }
}
