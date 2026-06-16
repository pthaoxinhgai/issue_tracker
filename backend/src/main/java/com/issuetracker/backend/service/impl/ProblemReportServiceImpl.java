package com.issuetracker.backend.service.impl;

import com.issuetracker.backend.domain.entity.ProblemReport;
import com.issuetracker.backend.domain.entity.User;
import com.issuetracker.backend.domain.enums.ActivityAction;
import com.issuetracker.backend.domain.enums.ReportStatus;
import com.issuetracker.backend.dto.request.ProblemReportRequest;
import com.issuetracker.backend.dto.response.ProblemReportDto;
import com.issuetracker.backend.repository.ProblemReportRepository;
import com.issuetracker.backend.repository.UserRepository;
import com.issuetracker.backend.security.SecurityUtils;
import com.issuetracker.backend.service.ActivityLogService;
import com.issuetracker.backend.service.ProblemReportService;
import com.issuetracker.backend.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
@RequiredArgsConstructor
public class ProblemReportServiceImpl implements ProblemReportService {

    private final ProblemReportRepository problemReportRepository;
    private final UserRepository userRepository;
    private final UserService userService;
    private final ActivityLogService activityLogService;

    private User getCurrentUser() {
        String email = SecurityUtils.getCurrentUserEmail();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Current user not found"));
    }

    @Override
    public ProblemReportDto createReport(ProblemReportRequest request) {
        User reporter = getCurrentUser();

        ProblemReport report = ProblemReport.builder()
                .title(request.getTitle())
                .description(request.getDescription())
                .status(ReportStatus.NEW)
                .reporter(reporter)
                .build();

        report = problemReportRepository.save(report);
        
        // Log activity
        activityLogService.logReportActivity(report, reporter, ActivityAction.STATUS_CHANGE, null, ReportStatus.NEW.name());

        return mapToDto(report);
    }

    @Override
    public ProblemReportDto getReportById(Long id) {
        ProblemReport report = problemReportRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Problem Report not found"));
        return mapToDto(report);
    }

    @Override
    public List<ProblemReportDto> getAllReports() {
        return problemReportRepository.findAll().stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Override
    public List<ProblemReportDto> getMyReports() {
        User user = getCurrentUser();
        return problemReportRepository.findByReporterId(user.getId()).stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Override
    public ProblemReportDto changeStatus(Long reportId, ReportStatus newStatus) {
        ProblemReport report = problemReportRepository.findById(reportId)
                .orElseThrow(() -> new RuntimeException("Problem Report not found"));

        if (report.getStatus() != newStatus) {
            User currentUser = getCurrentUser();
            activityLogService.logReportActivity(report, currentUser, ActivityAction.STATUS_CHANGE, report.getStatus().name(), newStatus.name());
            report.setStatus(newStatus);
            report = problemReportRepository.save(report);
        }
        return mapToDto(report);
    }

    public ProblemReportDto mapToDto(ProblemReport report) {
        return ProblemReportDto.builder()
                .id(report.getId())
                .title(report.getTitle())
                .description(report.getDescription())
                .status(report.getStatus())
                .reporter(userService.mapToDto(report.getReporter()))
                .createdAt(report.getCreatedAt())
                .updatedAt(report.getUpdatedAt())
                .build();
    }
}
