package com.issuetracker.backend.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DashboardStatsDto {
    private long totalIssues;
    private long openIssues;
    private long closedIssues;
    private long unassignedIssues;
    private long slaBreachedIssues;
    private long slaWarningIssues;
    
    private Map<String, Long> issuesByStatus;
    private Map<String, Long> issuesByPriority;
    private Map<String, Long> issuesBySeverity;
}
