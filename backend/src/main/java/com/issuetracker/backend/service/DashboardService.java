package com.issuetracker.backend.service;

import com.issuetracker.backend.domain.entity.Issue;
import com.issuetracker.backend.domain.enums.IssueStatus;
import com.issuetracker.backend.dto.response.DashboardStatsDto;
import com.issuetracker.backend.repository.IssueRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DashboardService {

    private final IssueRepository issueRepository;

    public DashboardStatsDto getDashboardStats() {
        List<Issue> issues = issueRepository.findAll();
        LocalDateTime now = LocalDateTime.now();

        long total = issues.size();
        long closed = issues.stream()
                .filter(i -> i.getStatus() == IssueStatus.RESOLVED || i.getStatus() == IssueStatus.CLOSED)
                .count();
        long open = total - closed;
        long unassigned = issues.stream()
                .filter(i -> i.getStatus() != IssueStatus.RESOLVED && i.getStatus() != IssueStatus.CLOSED && i.getAssignee() == null)
                .count();

        long slaBreached = issues.stream()
                .filter(i -> i.getStatus() != IssueStatus.RESOLVED && i.getStatus() != IssueStatus.CLOSED)
                .filter(i -> i.getDueDate() != null && now.isAfter(i.getDueDate()))
                .count();

        long slaWarning = issues.stream()
                .filter(i -> i.getStatus() != IssueStatus.RESOLVED && i.getStatus() != IssueStatus.CLOSED)
                .filter(i -> i.getDueDate() != null && now.plusMinutes(30).isAfter(i.getDueDate()) && now.isBefore(i.getDueDate()))
                .count();

        Map<String, Long> byStatus = issues.stream()
                .collect(Collectors.groupingBy(i -> i.getStatus().name(), Collectors.counting()));

        Map<String, Long> byPriority = issues.stream()
                .filter(i -> i.getStatus() != IssueStatus.RESOLVED && i.getStatus() != IssueStatus.CLOSED)
                .collect(Collectors.groupingBy(i -> i.getPriority().name(), Collectors.counting()));

        Map<String, Long> bySeverity = issues.stream()
                .filter(i -> i.getStatus() != IssueStatus.RESOLVED && i.getStatus() != IssueStatus.CLOSED && i.getSeverity() != null)
                .collect(Collectors.groupingBy(i -> i.getSeverity().name(), Collectors.counting()));

        return DashboardStatsDto.builder()
                .totalIssues(total)
                .openIssues(open)
                .closedIssues(closed)
                .unassignedIssues(unassigned)
                .slaBreachedIssues(slaBreached)
                .slaWarningIssues(slaWarning)
                .issuesByStatus(byStatus)
                .issuesByPriority(byPriority)
                .issuesBySeverity(bySeverity)
                .build();
    }
}
