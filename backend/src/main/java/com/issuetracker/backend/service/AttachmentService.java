package com.issuetracker.backend.service;

import com.issuetracker.backend.domain.entity.User;
import com.issuetracker.backend.dto.response.AttachmentDto;
import org.springframework.core.io.Resource;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

public interface AttachmentService {
    AttachmentDto uploadAttachment(Long issueId, MultipartFile file, User uploader);
    List<AttachmentDto> getAttachmentsByIssue(Long issueId);
    Resource loadAttachmentAsResource(Long attachmentId);
    AttachmentDto getAttachmentById(Long attachmentId);
    Resource loadFileAsResource(String fileName);
}
