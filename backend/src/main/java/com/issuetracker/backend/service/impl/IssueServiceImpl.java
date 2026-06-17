package com.issuetracker.backend.service.impl;

import com.issuetracker.backend.domain.entity.Issue;
import com.issuetracker.backend.domain.entity.User;
import com.issuetracker.backend.domain.enums.ActivityAction;
import com.issuetracker.backend.domain.enums.IssueStatus;
import com.issuetracker.backend.domain.enums.Priority;
import com.issuetracker.backend.dto.response.IssueDto;
import com.issuetracker.backend.repository.IssueRepository;
import com.issuetracker.backend.repository.UserRepository;
import com.issuetracker.backend.security.SecurityUtils;
import com.issuetracker.backend.service.ActivityLogService;
import com.issuetracker.backend.service.IssueService;
import com.issuetracker.backend.service.UserService;
import com.issuetracker.backend.statemachine.IssueStateMachine;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
@RequiredArgsConstructor
public class IssueServiceImpl implements IssueService {

    private final IssueRepository issueRepository;
    private final UserRepository userRepository;
    private final UserService userService;
    private final IssueStateMachine issueStateMachine;
    private final ActivityLogService activityLogService;
    private final com.issuetracker.backend.repository.ProblemReportRepository problemReportRepository;
    private final com.issuetracker.backend.service.NotificationService notificationService;
    private final com.issuetracker.backend.repository.ProjectRepository projectRepository;

    @jakarta.annotation.PostConstruct
    public void initDefaultProject() {
        if (projectRepository.count() == 0) {
            com.issuetracker.backend.domain.entity.Project defaultProject = com.issuetracker.backend.domain.entity.Project.builder()
                    .name("Default Project")
                    .description("Auto-generated default project")
                    .build();
            defaultProject = projectRepository.save(defaultProject);
            
            List<Issue> issues = issueRepository.findAll();
            for (Issue issue : issues) {
                if (issue.getProject() == null) {
                    issue.setProject(defaultProject);
                    issueRepository.save(issue);
                }
            }
        }
    }

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

    private User getCurrentUser() {
        String email = SecurityUtils.getCurrentUserEmail();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Current user not found"));
    }

    public IssueDto createIssue(IssueDto dto) {
        User creator = getCurrentUser();

        com.issuetracker.backend.domain.entity.ProblemReport report = 
                problemReportRepository.findById(dto.getProblemReportId())
                .orElseThrow(() -> new RuntimeException("Problem Report not found"));

        com.issuetracker.backend.domain.entity.Project issueProject = null;
        if (dto.getProjectId() != null) {
            issueProject = projectRepository.findById(dto.getProjectId())
                    .orElseThrow(() -> new RuntimeException("Project not found"));
        } else if (dto.getProject() != null && dto.getProject().getId() != null) {
            issueProject = projectRepository.findById(dto.getProject().getId())
                    .orElseThrow(() -> new RuntimeException("Project not found"));
        } else {
            // fallback to default project
            issueProject = projectRepository.findByName("Default Project").orElse(null);
        }

        Issue issue = Issue.builder()
                .title(dto.getTitle())
                .description(dto.getDescription())
                .type(dto.getType())
                .status(IssueStatus.OPEN)
                .priority(dto.getPriority())
                .severity(dto.getSeverity())
                .project(issueProject)
                .creator(creator)
                .problemReport(report)
                .labels(dto.getLabels() != null ? dto.getLabels() : new java.util.HashSet<>())
                .build();

        issue = issueRepository.save(issue);
        return mapToDto(issue);
    }

    public IssueDto updateIssue(Long id, IssueDto dto) {
        Issue issue = issueRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Issue not found"));
        
        User currentUser = getCurrentUser();

        if (dto.getTitle() != null && !dto.getTitle().equals(issue.getTitle())) {
            activityLogService.logActivity(issue, currentUser, ActivityAction.ISSUE_UPDATE, issue.getTitle(), dto.getTitle());
            issue.setTitle(dto.getTitle());
        }
        if (dto.getDescription() != null && !dto.getDescription().equals(issue.getDescription())) {
            activityLogService.logActivity(issue, currentUser, ActivityAction.ISSUE_UPDATE, issue.getDescription(), dto.getDescription());
            issue.setDescription(dto.getDescription());
        }
        if (dto.getType() != null && dto.getType() != issue.getType()) {
            activityLogService.logActivity(issue, currentUser, ActivityAction.ISSUE_UPDATE, issue.getType().name(), dto.getType().name());
            issue.setType(dto.getType());
        }
        if (dto.getPriority() != null && dto.getPriority() != issue.getPriority()) {
            activityLogService.logActivity(issue, currentUser, ActivityAction.PRIORITY_CHANGE, issue.getPriority().name(), dto.getPriority().name());
            issue.setPriority(dto.getPriority());
        }
        if (dto.getSeverity() != null && dto.getSeverity() != issue.getSeverity()) {
            activityLogService.logActivity(issue, currentUser, ActivityAction.ISSUE_UPDATE, 
                issue.getSeverity() != null ? issue.getSeverity().name() : "NONE", dto.getSeverity().name());
            issue.setSeverity(dto.getSeverity());
        }
        
        if (dto.getProjectId() != null && (issue.getProject() == null || !dto.getProjectId().equals(issue.getProject().getId()))) {
            com.issuetracker.backend.domain.entity.Project newProject = projectRepository.findById(dto.getProjectId())
                    .orElseThrow(() -> new RuntimeException("Project not found"));
            issue.setProject(newProject);
        } else if (dto.getProject() != null && dto.getProject().getId() != null && (issue.getProject() == null || !dto.getProject().getId().equals(issue.getProject().getId()))) {
            com.issuetracker.backend.domain.entity.Project newProject = projectRepository.findById(dto.getProject().getId())
                    .orElseThrow(() -> new RuntimeException("Project not found"));
            issue.setProject(newProject);
        }
        
        if (dto.getStatus() != null && dto.getStatus() != issue.getStatus()) {
            issueStateMachine.validateTransition(issue.getStatus(), dto.getStatus());
            activityLogService.logActivity(issue, currentUser, ActivityAction.STATUS_CHANGE, issue.getStatus().name(), dto.getStatus().name());
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
        
        User currentUser = getCurrentUser();
        String oldAssignee = issue.getAssignee() != null ? issue.getAssignee().getEmail() : "Unassigned";

        boolean isNewAssignee = issue.getAssignee() == null || !issue.getAssignee().getId().equals(assignee.getId());

        issue.setAssignee(assignee);
        issue = issueRepository.save(issue);
        
        activityLogService.logActivity(issue, currentUser, ActivityAction.ASSIGNEE_CHANGE, oldAssignee, assignee.getEmail());
        
        if (isNewAssignee) {
            notificationService.createNotification(assignee, 
                currentUser.getName() + " assigned you to Issue #" + issue.getId() + ": " + issue.getTitle(), 
                issue.getId());
        }

        return mapToDto(issue);
    }

    public IssueDto changeStatus(Long issueId, IssueStatus newStatus) {
        Issue issue = issueRepository.findById(issueId)
                .orElseThrow(() -> new RuntimeException("Issue not found"));

        if (issue.getStatus() != newStatus) {
            issueStateMachine.validateTransition(issue.getStatus(), newStatus);
            User currentUser = getCurrentUser();
            activityLogService.logActivity(issue, currentUser, ActivityAction.STATUS_CHANGE, issue.getStatus().name(), newStatus.name());
            issue.setStatus(newStatus);
            issue = issueRepository.save(issue);
        }
        return mapToDto(issue);
    }

    public List<IssueDto> filterIssues(IssueStatus status, Long assigneeId, Priority priority) {
        return issueRepository.findFilteredIssues(status, assigneeId, priority).stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    public IssueDto addLabel(Long issueId, String label) {
        Issue issue = issueRepository.findById(issueId)
                .orElseThrow(() -> new RuntimeException("Issue not found"));
        if (issue.getLabels().add(label)) {
            User currentUser = getCurrentUser();
            activityLogService.logActivity(issue, currentUser, ActivityAction.LABEL_ADD, null, label);
            issue = issueRepository.save(issue);
        }
        return mapToDto(issue);
    }

    public IssueDto removeLabel(Long issueId, String label) {
        Issue issue = issueRepository.findById(issueId)
                .orElseThrow(() -> new RuntimeException("Issue not found"));
        if (issue.getLabels().remove(label)) {
            User currentUser = getCurrentUser();
            activityLogService.logActivity(issue, currentUser, ActivityAction.LABEL_REMOVE, label, null);
            issue = issueRepository.save(issue);
        }
        return mapToDto(issue);
    }

    private IssueDto mapToDto(Issue issue) {
        return IssueDto.builder()
                .id(issue.getId())
                .title(issue.getTitle())
                .description(issue.getDescription())
                .type(issue.getType())
                .status(issue.getStatus())
                .priority(issue.getPriority())
                .severity(issue.getSeverity())
                .project(issue.getProject() != null ? com.issuetracker.backend.dto.response.ProjectDto.builder()
                        .id(issue.getProject().getId())
                        .name(issue.getProject().getName())
                        .build() : null)
                .labels(issue.getLabels())
                .assignee(userService.mapToDto(issue.getAssignee()))
                .creator(userService.mapToDto(issue.getCreator()))
                .problemReportId(issue.getProblemReport().getId())
                .createdAt(issue.getCreatedAt())
                .updatedAt(issue.getUpdatedAt())
                .build();
    }
}
