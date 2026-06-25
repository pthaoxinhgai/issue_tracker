package com.issuetracker.backend.service;

import com.issuetracker.backend.domain.enums.ReportStatus;
import com.issuetracker.backend.dto.request.ProblemReportRequest;
import com.issuetracker.backend.dto.response.ProblemReportDto;

import java.util.List;

public interface ProblemReportService {
    ProblemReportDto createReport(ProblemReportRequest request);
    ProblemReportDto getReportById(Long id);
    List<ProblemReportDto> getAllReports();
    List<ProblemReportDto> getMyReports();
    ProblemReportDto changeStatus(Long reportId, ReportStatus newStatus);
    void deleteReport(Long id);
}
