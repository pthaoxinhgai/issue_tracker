package com.issuetracker.backend.service;

import com.issuetracker.backend.domain.entity.User;
import com.issuetracker.backend.dto.response.ImportResultDto;
import org.springframework.web.multipart.MultipartFile;

public interface ImportService {
    ImportResultDto importIssues(MultipartFile file, User currentUser);
}
