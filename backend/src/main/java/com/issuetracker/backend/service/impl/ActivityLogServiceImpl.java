package com.issuetracker.backend.service.impl;

import com.issuetracker.backend.domain.entity.ActivityLog;
import com.issuetracker.backend.domain.entity.Issue;
import com.issuetracker.backend.domain.entity.User;
import com.issuetracker.backend.domain.enums.ActivityAction;
import com.issuetracker.backend.dto.response.ActivityLogDto;
import com.issuetracker.backend.repository.ActivityLogRepository;
import com.issuetracker.backend.service.ActivityLogService;
import com.issuetracker.backend.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
@RequiredArgsConstructor
public class ActivityLogServiceImpl implements ActivityLogService {

    private final ActivityLogRepository activityLogRepository;
    private final UserService userService;

    @Override
    public void logActivity(Issue issue, User user, ActivityAction action, String oldValue, String newValue) {
        ActivityLog log = ActivityLog.builder()
                .issue(issue)
                .user(user)
                .action(action)
                .oldValue(oldValue)
                .newValue(newValue)
                .build();
        activityLogRepository.save(log);
    }

    @Override
    public void logReportActivity(com.issuetracker.backend.domain.entity.ProblemReport report, User user, ActivityAction action, String oldValue, String newValue) {
        ActivityLog log = ActivityLog.builder()
                .problemReport(report)
                .user(user)
                .action(action)
                .oldValue(oldValue)
                .newValue(newValue)
                .build();
        activityLogRepository.save(log);
    }

    @Override
    @Transactional(readOnly = true)
    public List<ActivityLogDto> getActivitiesByIssue(Long issueId) {
        return activityLogRepository.findByIssueIdOrderByCreatedAtDesc(issueId).stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<ActivityLogDto> getActivitiesByReport(Long reportId) {
        return activityLogRepository.findByProblemReportIdOrderByCreatedAtDesc(reportId).stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    private ActivityLogDto mapToDto(ActivityLog log) {
        return ActivityLogDto.builder()
                .id(log.getId())
                .issueId(log.getIssue() != null ? log.getIssue().getId() : null)
                .problemReportId(log.getProblemReport() != null ? log.getProblemReport().getId() : null)
                .user(userService.mapToDto(log.getUser()))
                .action(log.getAction())
                .oldValue(log.getOldValue())
                .newValue(log.getNewValue())
                .createdAt(log.getCreatedAt())
                .build();
    }
}
