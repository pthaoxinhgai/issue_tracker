package com.issuetracker.backend.service;

import com.issuetracker.backend.domain.entity.Issue;
import com.issuetracker.backend.domain.entity.User;
import com.issuetracker.backend.domain.enums.ActivityAction;
import com.issuetracker.backend.dto.response.ActivityLogDto;

import java.util.List;

public interface ActivityLogService {
    void logActivity(Issue issue, User user, ActivityAction action, String oldValue, String newValue);
    void logReportActivity(com.issuetracker.backend.domain.entity.ProblemReport report, User user, ActivityAction action, String oldValue, String newValue);
    List<ActivityLogDto> getActivitiesByIssue(Long issueId);
    List<ActivityLogDto> getActivitiesByReport(Long reportId);
}
