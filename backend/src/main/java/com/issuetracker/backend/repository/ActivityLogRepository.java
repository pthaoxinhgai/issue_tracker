package com.issuetracker.backend.repository;

import com.issuetracker.backend.domain.entity.ActivityLog;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ActivityLogRepository extends JpaRepository<ActivityLog, Long> {
    
    @EntityGraph(attributePaths = {"user"})
    List<ActivityLog> findByIssueIdOrderByCreatedAtDesc(Long issueId);

    @EntityGraph(attributePaths = {"user"})
    List<ActivityLog> findByProblemReportIdOrderByCreatedAtDesc(Long problemReportId);
}
