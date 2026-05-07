package com.issuetracker.backend.service;

import com.issuetracker.backend.domain.entity.Issue;
import com.issuetracker.backend.domain.entity.User;
import com.issuetracker.backend.domain.enums.IssueStatus;
import com.issuetracker.backend.dto.IssueDto;
import com.issuetracker.backend.repository.IssueRepository;
import com.issuetracker.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
@RequiredArgsConstructor
public class IssueService {

    private final IssueRepository issueRepository;
    private final UserRepository userRepository;
    private final UserService userService;

    public List<IssueDto> getAllIssues() {
        return issueRepository.findAll().stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    public IssueDto getIssueById(Long id) {
        Issue issue = issueRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Issue not found"));
        return mapToDto(issue);
    }

    public IssueDto createIssue(IssueDto dto, Long reporterId) {
        User reporter = userRepository.findById(reporterId)
                .orElseThrow(() -> new RuntimeException("Reporter not found"));

        Issue issue = Issue.builder()
                .title(dto.getTitle())
                .description(dto.getDescription())
                .type(dto.getType())
                .status(IssueStatus.TODO) // Initial status is always TODO
                .priority(dto.getPriority())
                .reporter(reporter)
                .build();

        issue = issueRepository.save(issue);
        return mapToDto(issue);
    }

    public IssueDto updateIssue(Long id, IssueDto dto) {
        Issue issue = issueRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Issue not found"));

        if (dto.getTitle() != null) {
            issue.setTitle(dto.getTitle());
        }
        if (dto.getDescription() != null) {
            issue.setDescription(dto.getDescription());
        }
        if (dto.getType() != null) {
            issue.setType(dto.getType());
        }
        if (dto.getPriority() != null) {
            issue.setPriority(dto.getPriority());
        }
        
        if (dto.getStatus() != null && dto.getStatus() != issue.getStatus()) {
            validateStatusTransition(issue.getStatus(), dto.getStatus());
            issue.setStatus(dto.getStatus());
        }

        issue = issueRepository.save(issue);
        return mapToDto(issue);
    }

    public void deleteIssue(Long id) {
        issueRepository.deleteById(id);
    }

    public IssueDto assignIssue(Long issueId, Long userId) {
        Issue issue = issueRepository.findById(issueId)
                .orElseThrow(() -> new RuntimeException("Issue not found"));
        User assignee = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Assignee not found"));

        issue.setAssignee(assignee);
        issue = issueRepository.save(issue);
        return mapToDto(issue);
    }

    private void validateStatusTransition(IssueStatus current, IssueStatus next) {
        if (current == IssueStatus.TODO && next != IssueStatus.IN_PROGRESS) {
            throw new RuntimeException("Can only transition from TODO to IN_PROGRESS");
        }
        if (current == IssueStatus.IN_PROGRESS && next != IssueStatus.REVIEW) {
            throw new RuntimeException("Can only transition from IN_PROGRESS to REVIEW");
        }
        if (current == IssueStatus.REVIEW && next != IssueStatus.DONE && next != IssueStatus.IN_PROGRESS) {
            // Allow going back to IN_PROGRESS from REVIEW
            throw new RuntimeException("Can only transition from REVIEW to DONE or back to IN_PROGRESS");
        }
        if (current == IssueStatus.DONE && next != IssueStatus.TODO) {
            throw new RuntimeException("Done issues can only be reopened to TODO");
        }
    }

    private IssueDto mapToDto(Issue issue) {
        return IssueDto.builder()
                .id(issue.getId())
                .title(issue.getTitle())
                .description(issue.getDescription())
                .type(issue.getType())
                .status(issue.getStatus())
                .priority(issue.getPriority())
                .assignee(userService.mapToDto(issue.getAssignee()))
                .reporter(userService.mapToDto(issue.getReporter()))
                .createdAt(issue.getCreatedAt())
                .updatedAt(issue.getUpdatedAt())
                .build();
    }
}
