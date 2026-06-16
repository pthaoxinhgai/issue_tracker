package com.issuetracker.backend.repository;

import com.issuetracker.backend.domain.entity.ProblemReport;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProblemReportRepository extends JpaRepository<ProblemReport, Long> {
    List<ProblemReport> findByReporterId(Long reporterId);
}
