package com.issuetracker.backend.schedule;

import com.issuetracker.backend.domain.entity.Issue;
import com.issuetracker.backend.domain.entity.User;
import com.issuetracker.backend.domain.enums.IssueStatus;
import com.issuetracker.backend.domain.enums.Role;
import com.issuetracker.backend.repository.IssueRepository;
import com.issuetracker.backend.repository.UserRepository;
import com.issuetracker.backend.service.NotificationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.List;

@Component
@RequiredArgsConstructor
@Slf4j
public class SlaWarningJob {

    private final IssueRepository issueRepository;
    private final NotificationService notificationService;
    private final UserRepository userRepository;

    // Run every minute for testing. In production, this would be e.g. "0 0 * * * *" (every hour)
    @Scheduled(cron = "0 * * * * *")
    public void checkSlaBreaches() {
        log.info("Running SLA Warning check...");
        
        // Find issues that are NEW, ASSIGNED, or IN_PROGRESS
        List<Issue> activeIssues = issueRepository.findAll().stream()
                .filter(issue -> issue.getStatus() == IssueStatus.NEW || 
                                 issue.getStatus() == IssueStatus.ASSIGNED || 
                                 issue.getStatus() == IssueStatus.IN_PROGRESS)
                .toList();

        LocalDateTime now = LocalDateTime.now();
        List<User> engineeringManagers = userRepository.findAll().stream()
                .filter(u -> u.getRole() == Role.ENGINEERING_MANAGER)
                .toList();

        for (Issue issue : activeIssues) {
            if (issue.getDueDate() == null) continue;

            // Check SLA Breach
            if (now.isAfter(issue.getDueDate())) {
                String warningMessage = "SLA BREACH: Issue #" + issue.getId() + " (" + issue.getSeverity() + ") is OVERDUE!";
                
                if (issue.getAssignee() != null) {
                    notificationService.createNotification(issue.getAssignee(), warningMessage, issue.getId());
                }
                
                for (User manager : engineeringManagers) {
                    notificationService.createNotification(manager, warningMessage, issue.getId());
                }
            } 
            // Check SLA Warning (e.g. within 30 minutes of due date)
            else if (now.plusMinutes(30).isAfter(issue.getDueDate())) {
                String warningMessage = "SLA WARNING: Issue #" + issue.getId() + " (" + issue.getSeverity() + ") is approaching its deadline!";
                
                if (issue.getAssignee() != null) {
                    notificationService.createNotification(issue.getAssignee(), warningMessage, issue.getId());
                }
            }
        }
    }
}
