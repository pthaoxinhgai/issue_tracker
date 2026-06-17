package com.issuetracker.backend.repository;

import com.issuetracker.backend.domain.entity.Attachment;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface AttachmentRepository extends JpaRepository<Attachment, Long> {
    List<Attachment> findByIssueId(Long issueId);
}
