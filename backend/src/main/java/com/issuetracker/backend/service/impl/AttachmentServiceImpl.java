package com.issuetracker.backend.service.impl;

import com.issuetracker.backend.domain.entity.Attachment;
import com.issuetracker.backend.domain.entity.Issue;
import com.issuetracker.backend.domain.entity.User;
import com.issuetracker.backend.dto.response.AttachmentDto;
import com.issuetracker.backend.dto.response.UserDto;
import com.issuetracker.backend.exception.ResourceNotFoundException;
import com.issuetracker.backend.repository.AttachmentRepository;
import com.issuetracker.backend.repository.IssueRepository;
import com.issuetracker.backend.service.AttachmentService;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class AttachmentServiceImpl implements AttachmentService {

    private final AttachmentRepository attachmentRepository;
    private final IssueRepository issueRepository;
    
    private final Path fileStorageLocation = Paths.get("uploads").toAbsolutePath().normalize();

    @PostConstruct
    public void init() {
        try {
            Files.createDirectories(this.fileStorageLocation);
        } catch (Exception ex) {
            throw new RuntimeException("Could not create the directory where the uploaded files will be stored.", ex);
        }
    }

    @Override
    @Transactional
    public AttachmentDto uploadAttachment(Long issueId, MultipartFile file, User uploader) {
        Issue issue = issueRepository.findById(issueId)
                .orElseThrow(() -> new ResourceNotFoundException("Issue not found"));

        String originalFileName = StringUtils.cleanPath(file.getOriginalFilename());
        
        try {
            if(originalFileName.contains("..")) {
                throw new RuntimeException("Filename contains invalid path sequence " + originalFileName);
            }

            // Generate unique filename to avoid overwriting
            String uniqueFileName = UUID.randomUUID().toString() + "_" + originalFileName;
            Path targetLocation = this.fileStorageLocation.resolve(uniqueFileName);
            Files.copy(file.getInputStream(), targetLocation, StandardCopyOption.REPLACE_EXISTING);

            String fileUrl = "/api/attachments/" + uniqueFileName;

            Attachment attachment = Attachment.builder()
                    .fileName(originalFileName)
                    .fileType(file.getContentType())
                    .fileUrl(fileUrl)
                    .issue(issue)
                    .uploadedBy(uploader)
                    .build();

            attachment = attachmentRepository.save(attachment);
            return mapToDto(attachment);
        } catch (IOException ex) {
            throw new RuntimeException("Could not store file " + originalFileName + ". Please try again!", ex);
        }
    }

    @Override
    public List<AttachmentDto> getAttachmentsByIssue(Long issueId) {
        return attachmentRepository.findByIssueId(issueId).stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Override
    public AttachmentDto getAttachmentById(Long attachmentId) {
        Attachment attachment = attachmentRepository.findById(attachmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Attachment not found"));
        return mapToDto(attachment);
    }

    @Override
    public Resource loadAttachmentAsResource(Long attachmentId) {
        // Load by ID, but wait, the URL contains the filename directly in this design: /api/attachments/{filename}
        // Actually, let's load by filename for the Controller.
        return null; // Will implement a method to load by filename
    }
    
    public Resource loadFileAsResource(String fileName) {
        try {
            Path filePath = this.fileStorageLocation.resolve(fileName).normalize();
            Resource resource = new UrlResource(filePath.toUri());
            if(resource.exists()) {
                return resource;
            } else {
                throw new ResourceNotFoundException("File not found " + fileName);
            }
        } catch (Exception ex) {
            throw new ResourceNotFoundException("File not found " + fileName);
        }
    }

    private AttachmentDto mapToDto(Attachment attachment) {
        UserDto uploaderDto = UserDto.builder()
                .id(attachment.getUploadedBy().getId())
                .name(attachment.getUploadedBy().getName())
                .email(attachment.getUploadedBy().getEmail())
                .role(attachment.getUploadedBy().getRole())
                .build();

        return AttachmentDto.builder()
                .id(attachment.getId())
                .fileName(attachment.getFileName())
                .fileType(attachment.getFileType())
                .fileUrl(attachment.getFileUrl())
                .issueId(attachment.getIssue().getId())
                .uploadedBy(uploaderDto)
                .createdAt(attachment.getCreatedAt())
                .build();
    }
}
