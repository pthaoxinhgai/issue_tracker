package com.issuetracker.backend.service;

import com.issuetracker.backend.dto.response.IssueDto;
import java.util.List;

public interface IssueService {
    List<IssueDto> getAllIssues();
    IssueDto getIssueById(Long id);
    IssueDto createIssue(IssueDto dto);
    IssueDto updateIssue(Long id, IssueDto dto);
    void deleteIssue(Long id);
    IssueDto assignIssue(Long issueId, Long userId);
    IssueDto changeStatus(Long issueId, com.issuetracker.backend.domain.enums.IssueStatus newStatus);
    List<IssueDto> filterIssues(com.issuetracker.backend.domain.enums.IssueStatus status, Long assigneeId, com.issuetracker.backend.domain.enums.Priority priority);
    IssueDto addLabel(Long issueId, String label);
    IssueDto removeLabel(Long issueId, String label);
    IssueDto escalateIssue(Long issueId, String reason, String impactLevel, String evidence);
    IssueDto linkIssues(Long sourceId, Long targetId, String linkType);
    List<IssueDto> searchIssues(String query);
    IssueDto mergeDuplicate(Long duplicateId, Long primaryId);
}
