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
import java.time.LocalDateTime;
import com.issuetracker.backend.domain.enums.Severity;

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
    private final com.issuetracker.backend.repository.IssueLinkRepository issueLinkRepository;
    private final com.issuetracker.backend.repository.ActivityLogRepository activityLogRepository;

    @jakarta.annotation.PostConstruct
    public void initDefaultProject() {
        if (projectRepository.count() == 0) {
            com.issuetracker.backend.domain.entity.Project defaultProject = com.issuetracker.backend.domain.entity.Project.builder()
                    .name("Default Project")
                    .description("Auto-generated default project")
                    .keyPrefix("DEF")
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
        User currentUser = getCurrentUser();
        if (currentUser.getRole() == com.issuetracker.backend.domain.enums.Role.DEVELOPER || currentUser.getRole() == com.issuetracker.backend.domain.enums.Role.QA) {
            if (issue.getAssignee() == null || !issue.getAssignee().getId().equals(currentUser.getId())) {
                throw new RuntimeException("Access Denied: You are not assigned to this issue");
            }
        }
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

        LocalDateTime dueDate = calculateDueDate(dto.getSeverity());

        Issue issue = Issue.builder()
                .title(dto.getTitle())
                .description(dto.getDescription())
                .type(dto.getType())
                .status(IssueStatus.NEW)
                .priority(dto.getPriority())
                .severity(dto.getSeverity())
                .project(issueProject)
                .creator(creator)
                .problemReport(report)
                .dueDate(dueDate)
                .labels(dto.getLabels() != null ? dto.getLabels() : new java.util.HashSet<>())
                .build();

        issue = issueRepository.save(issue);
        activityLogService.logActivity(issue, creator, ActivityAction.ISSUE_CREATE, null, issue.getStatus().name());
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
            issue.setDueDate(calculateDueDate(dto.getSeverity()));
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

        if (issue.getStatus() == IssueStatus.NEW || issue.getStatus() == IssueStatus.TRIAGED || issue.getStatus() == IssueStatus.ESCALATED || issue.getStatus() == IssueStatus.REOPENED) {
            issueStateMachine.validateTransition(issue.getStatus(), IssueStatus.ASSIGNED);
            activityLogService.logActivity(issue, currentUser, ActivityAction.STATUS_CHANGE, issue.getStatus().name(), IssueStatus.ASSIGNED.name());
            issue.setStatus(IssueStatus.ASSIGNED);
        }

        return mapToDto(issue);
    }

    public IssueDto changeStatus(Long issueId, IssueStatus newStatus) {
        Issue issue = issueRepository.findById(issueId)
                .orElseThrow(() -> new RuntimeException("Issue not found"));

        if (issue.getStatus() != newStatus) {
            IssueStatus oldStatus = issue.getStatus();
            issueStateMachine.validateTransition(oldStatus, newStatus);
            User currentUser = getCurrentUser();
            
            activityLogService.logActivity(issue, currentUser, ActivityAction.STATUS_CHANGE, oldStatus.name(), newStatus.name());
            issue.setStatus(newStatus);
            
            // Notification on status change
            String message = currentUser.getName() + " changed status to " + newStatus.name() + " on Issue #" + issue.getId();
            
            // Auto-assign back to Developer if QA rejects
            if (oldStatus == IssueStatus.READY_FOR_QA && newStatus == IssueStatus.IN_PROGRESS) {
                List<com.issuetracker.backend.domain.entity.ActivityLog> logs = activityLogRepository.findByIssueIdOrderByCreatedAtDesc(issueId);
                User previousDev = null;
                for (com.issuetracker.backend.domain.entity.ActivityLog log : logs) {
                    if (log.getAction() == ActivityAction.STATUS_CHANGE && "READY_FOR_QA".equals(log.getNewValue())) {
                        previousDev = log.getUser();
                        break;
                    }
                }
                
                if (previousDev != null && !previousDev.getId().equals(currentUser.getId())) {
                    String oldAssigneeStr = issue.getAssignee() != null ? issue.getAssignee().getEmail() : "Unassigned";
                    issue.setAssignee(previousDev);
                    activityLogService.logActivity(issue, currentUser, ActivityAction.ASSIGNEE_CHANGE, oldAssigneeStr, previousDev.getEmail());
                    notificationService.createNotification(previousDev, 
                        currentUser.getName() + " rejected Issue #" + issue.getId() + " and assigned it back to you.", 
                        issue.getId());
                } else if (issue.getAssignee() != null && !issue.getAssignee().getId().equals(currentUser.getId())) {
                    notificationService.createNotification(issue.getAssignee(), message, issue.getId());
                }
            } else {
                if (issue.getAssignee() != null && !issue.getAssignee().getId().equals(currentUser.getId())) {
                    notificationService.createNotification(issue.getAssignee(), message, issue.getId());
                }
            }

            if (issue.getCreator() != null && !issue.getCreator().getId().equals(currentUser.getId()) &&
               (issue.getAssignee() == null || !issue.getCreator().getId().equals(issue.getAssignee().getId()))) {
                notificationService.createNotification(issue.getCreator(), message, issue.getId());
            }

            issue = issueRepository.save(issue);
        }
        return mapToDto(issue);
    }
    public List<IssueDto> filterIssues(IssueStatus status, Long assigneeId, Priority priority) {
        User currentUser = getCurrentUser();
        if (currentUser.getRole() == com.issuetracker.backend.domain.enums.Role.DEVELOPER || currentUser.getRole() == com.issuetracker.backend.domain.enums.Role.QA) {
            assigneeId = currentUser.getId();
        }
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

    public IssueDto escalateIssue(Long issueId, String reason, String impactLevel, String evidence) {
        Issue issue = issueRepository.findById(issueId)
                .orElseThrow(() -> new RuntimeException("Issue not found"));

        User currentUser = getCurrentUser();
        
        issueStateMachine.validateTransition(issue.getStatus(), IssueStatus.ESCALATED);
        activityLogService.logActivity(issue, currentUser, ActivityAction.STATUS_CHANGE, issue.getStatus().name(), IssueStatus.ESCALATED.name());
        
        issue.setStatus(IssueStatus.ESCALATED);
        
        // Save escalation details as a comment
        String escalationComment = String.format("Escalated! Reason: %s | Impact: %s | Evidence: %s", reason, impactLevel, evidence);
        com.issuetracker.backend.domain.entity.Comment comment = com.issuetracker.backend.domain.entity.Comment.builder()
                .issue(issue)
                .user(currentUser)
                .content(escalationComment)
                .isInternal(true)
                .build();
        // Since we don't have comment repository injected here, we can rely on cascade if configured or just return for now
        // Wait, better to let a service handle it or use the notification.
        // Let's notify POs
        List<User> pos = userRepository.findAll().stream().filter(u -> u.getRole() == com.issuetracker.backend.domain.enums.Role.PRODUCT_OWNER || u.getRole() == com.issuetracker.backend.domain.enums.Role.ENGINEERING_MANAGER).toList();
        for (User po : pos) {
            notificationService.createNotification(po, "Issue #" + issue.getId() + " escalated by " + currentUser.getName(), issue.getId());
        }

        issue = issueRepository.save(issue);
        return mapToDto(issue);
    }

    public IssueDto linkIssues(Long sourceId, Long targetId, String linkType) {
        Issue source = issueRepository.findById(sourceId).orElseThrow(() -> new RuntimeException("Source Issue not found"));
        Issue target = issueRepository.findById(targetId).orElseThrow(() -> new RuntimeException("Target Issue not found"));

        com.issuetracker.backend.domain.entity.IssueLink link = com.issuetracker.backend.domain.entity.IssueLink.builder()
                .sourceIssue(source)
                .targetIssue(target)
                .linkType(linkType)
                .build();
        issueLinkRepository.save(link);
        
        // Add activity log
        User currentUser = getCurrentUser();
        activityLogService.logActivity(source, currentUser, com.issuetracker.backend.domain.enums.ActivityAction.ISSUE_UPDATE, null, "Linked to Issue #" + targetId + " as " + linkType);

        return mapToDto(source);
    }

    public List<IssueDto> searchIssues(String query) {
        return issueRepository.searchIssues(query).stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    public IssueDto mergeDuplicate(Long duplicateId, Long primaryId) {
        Issue duplicate = issueRepository.findById(duplicateId).orElseThrow(() -> new RuntimeException("Duplicate Issue not found"));
        Issue primary = issueRepository.findById(primaryId).orElseThrow(() -> new RuntimeException("Primary Issue not found"));
        
        if (duplicate.getId().equals(primary.getId())) {
            throw new RuntimeException("Cannot merge issue into itself");
        }

        // Link them
        com.issuetracker.backend.domain.entity.IssueLink link = com.issuetracker.backend.domain.entity.IssueLink.builder()
                .sourceIssue(duplicate)
                .targetIssue(primary)
                .linkType("DUPLICATE")
                .build();
        issueLinkRepository.save(link);
        
        User currentUser = getCurrentUser();
        
        // Close duplicate
        activityLogService.logActivity(duplicate, currentUser, com.issuetracker.backend.domain.enums.ActivityAction.STATUS_CHANGE, duplicate.getStatus().name(), IssueStatus.CLOSED.name());
        duplicate.setStatus(IssueStatus.CLOSED);
        
        // Add comment
        com.issuetracker.backend.domain.entity.Comment comment = com.issuetracker.backend.domain.entity.Comment.builder()
                .issue(duplicate)
                .user(currentUser)
                .content("Merged into Primary Issue #" + primaryId)
                .isInternal(true)
                .build();
                
        // Copy customer email if empty in primary (optional, skipping for simplicity)
        
        issueRepository.save(duplicate);
        return mapToDto(duplicate);
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
                .customerEmail(issue.getCustomerEmail())
                .attachmentLink(issue.getAttachmentLink())
                .duplicateCount(issueLinkRepository.countByTargetIssueIdAndLinkType(issue.getId(), "DUPLICATE"))
                .labels(issue.getLabels())
                .dueDate(issue.getDueDate())
                .createdAt(issue.getCreatedAt())
                .updatedAt(issue.getUpdatedAt())
                .build();
    }

    private LocalDateTime calculateDueDate(Severity severity) {
        if (severity == null) return LocalDateTime.now().plusHours(48);
        switch (severity) {
            case S1: return LocalDateTime.now().plusHours(2);
            case S2: return LocalDateTime.now().plusHours(8);
            case S3: return LocalDateTime.now().plusHours(24);
            case S4: return LocalDateTime.now().plusHours(48);
            default: return LocalDateTime.now().plusHours(48);
        }
    }
}
