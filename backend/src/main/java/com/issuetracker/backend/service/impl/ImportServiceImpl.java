package com.issuetracker.backend.service.impl;

import com.issuetracker.backend.domain.entity.Issue;
import com.issuetracker.backend.domain.entity.ProblemReport;
import com.issuetracker.backend.domain.entity.User;
import com.issuetracker.backend.domain.enums.IssueStatus;
import com.issuetracker.backend.domain.enums.IssueType;
import com.issuetracker.backend.domain.enums.Priority;
import com.issuetracker.backend.domain.enums.ReportStatus;
import com.issuetracker.backend.dto.response.ImportResultDto;
import com.issuetracker.backend.repository.IssueRepository;
import com.issuetracker.backend.repository.ProblemReportRepository;
import com.issuetracker.backend.service.ImportService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.csv.CSVFormat;
import org.apache.commons.csv.CSVParser;
import org.apache.commons.csv.CSVRecord;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.ss.usermodel.Workbook;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.InputStreamReader;
import java.io.Reader;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;

@Service
@RequiredArgsConstructor
@Slf4j
public class ImportServiceImpl implements ImportService {

    private final IssueRepository issueRepository;
    private final ProblemReportRepository problemReportRepository;

    @Override
    @Transactional
    public ImportResultDto importIssues(MultipartFile file, User currentUser) {
        String filename = file.getOriginalFilename();
        if (filename == null) filename = "unknown";

        ImportResultDto result = ImportResultDto.builder()
                .errors(new ArrayList<>())
                .build();

        // Create a common ProblemReport for this import batch
        String batchName = "Batch Import - " + LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss"));
        ProblemReport batchReport = ProblemReport.builder()
                .title(batchName)
                .description("Imported from file: " + filename)
                .status(ReportStatus.NEW)
                .reporter(currentUser)
                .build();
        batchReport = problemReportRepository.save(batchReport);

        try {
            if (filename.endsWith(".csv")) {
                processCsv(file, result, batchReport, currentUser);
            } else if (filename.endsWith(".xlsx")) {
                processExcel(file, result, batchReport, currentUser);
            } else {
                result.getErrors().add(new ImportResultDto.ImportError(0, "Unsupported file format. Only .csv and .xlsx are supported."));
            }
        } catch (Exception e) {
            log.error("Error processing file", e);
            result.getErrors().add(new ImportResultDto.ImportError(0, "File processing error: " + e.getMessage()));
        }

        return result;
    }

    private void processCsv(MultipartFile file, ImportResultDto result, ProblemReport batchReport, User creator) throws Exception {
        try (Reader reader = new InputStreamReader(file.getInputStream());
             CSVParser csvParser = new CSVParser(reader, CSVFormat.DEFAULT.builder()
                     .setHeader()
                     .setSkipHeaderRecord(true)
                     .setIgnoreHeaderCase(true)
                     .setTrim(true)
                     .setAllowMissingColumnNames(true)
                     .build())) {

            int rowNumber = 1;
            for (CSVRecord record : csvParser) {
                rowNumber++; // Header is 1
                result.setTotalRows(result.getTotalRows() + 1);

                try {
                    String title = record.get("title");
                    String description = record.isSet("description") ? record.get("description") : "";
                    String typeStr = record.isSet("type") ? record.get("type") : "TASK";
                    String priorityStr = record.isSet("priority") ? record.get("priority") : "LOW";
                    String labelsStr = record.isSet("labels") ? record.get("labels") : "";

                    Issue issue = createIssueFromData(title, description, typeStr, priorityStr, labelsStr, batchReport, creator);
                    issueRepository.save(issue);
                    result.setSuccessfulRows(result.getSuccessfulRows() + 1);

                } catch (Exception e) {
                    result.setFailedRows(result.getFailedRows() + 1);
                    result.getErrors().add(new ImportResultDto.ImportError(rowNumber, e.getMessage()));
                }
            }
        }
    }

    private void processExcel(MultipartFile file, ImportResultDto result, ProblemReport batchReport, User creator) throws Exception {
        try (Workbook workbook = new XSSFWorkbook(file.getInputStream())) {
            Sheet sheet = workbook.getSheetAt(0);
            Iterator<Row> rows = sheet.iterator();

            int rowNumber = 0;
            // Map column names to indices based on header
            Map<String, Integer> headerMap = new HashMap<>();

            while (rows.hasNext()) {
                Row currentRow = rows.next();
                rowNumber++;

                // Skip header row
                if (rowNumber == 1) {
                    for (int i = 0; i < currentRow.getLastCellNum(); i++) {
                        if (currentRow.getCell(i) != null) {
                            headerMap.put(currentRow.getCell(i).getStringCellValue().trim().toLowerCase(), i);
                        }
                    }
                    continue;
                }

                // Skip empty rows
                if (currentRow.getCell(headerMap.getOrDefault("title", 0)) == null) {
                    continue;
                }

                result.setTotalRows(result.getTotalRows() + 1);

                try {
                    String title = getCellValue(currentRow, headerMap.get("title"));
                    String description = getCellValue(currentRow, headerMap.get("description"));
                    String typeStr = getCellValue(currentRow, headerMap.get("type"));
                    String priorityStr = getCellValue(currentRow, headerMap.get("priority"));
                    String labelsStr = getCellValue(currentRow, headerMap.get("labels"));

                    if (typeStr.isEmpty()) typeStr = "TASK";
                    if (priorityStr.isEmpty()) priorityStr = "LOW";

                    Issue issue = createIssueFromData(title, description, typeStr, priorityStr, labelsStr, batchReport, creator);
                    issueRepository.save(issue);
                    result.setSuccessfulRows(result.getSuccessfulRows() + 1);

                } catch (Exception e) {
                    result.setFailedRows(result.getFailedRows() + 1);
                    result.getErrors().add(new ImportResultDto.ImportError(rowNumber, e.getMessage()));
                }
            }
        }
    }

    private String getCellValue(Row row, Integer index) {
        if (index == null || row.getCell(index) == null) {
            return "";
        }
        return row.getCell(index).getStringCellValue().trim();
    }

    private Issue createIssueFromData(String title, String description, String typeStr, String priorityStr, String labelsStr, ProblemReport batchReport, User creator) {
        if (title == null || title.trim().isEmpty()) {
            throw new IllegalArgumentException("Title is required");
        }

        IssueType type;
        try {
            type = IssueType.valueOf(typeStr.toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException("Invalid issue type: " + typeStr);
        }

        Priority priority;
        try {
            priority = Priority.valueOf(priorityStr.toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException("Invalid priority: " + priorityStr);
        }

        Set<String> labels = new HashSet<>();
        if (labelsStr != null && !labelsStr.trim().isEmpty()) {
            String[] labelArray = labelsStr.split(",");
            for (String label : labelArray) {
                labels.add(label.trim());
            }
        }

        return Issue.builder()
                .title(title)
                .description(description)
                .type(type)
                .priority(priority)
                .status(IssueStatus.OPEN)
                .problemReport(batchReport)
                .creator(creator)
                .labels(labels)
                .build();
    }
}
