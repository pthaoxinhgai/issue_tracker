package com.issuetracker.backend;

import com.issuetracker.backend.domain.entity.Issue;
import com.issuetracker.backend.domain.entity.ProblemReport;
import com.issuetracker.backend.repository.ProblemReportRepository;
import jakarta.persistence.EntityManager;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.annotation.Commit;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@SpringBootTest
@Transactional
@Commit
public class DeleteImportedIssuesTest {

    @Autowired
    private ProblemReportRepository problemReportRepository;

    @Autowired
    private EntityManager entityManager;

    @Test
    public void deleteVietnameseIssues() {
        System.out.println("Starting to delete Batch Import reports...");
        List<ProblemReport> reports = problemReportRepository.findAll();
        for (ProblemReport report : reports) {
            if (report.getTitle() != null && report.getTitle().startsWith("Batch Import")) {
                System.out.println("Processing report: " + report.getTitle());
                for (Issue issue : report.getIssues()) {
                    System.out.println("Deleting dependencies for issue: " + issue.getTitle());
                    
                    entityManager.createNativeQuery("DELETE FROM activity_logs WHERE issue_id = :issueId")
                            .setParameter("issueId", issue.getId()).executeUpdate();
                            
                    entityManager.createNativeQuery("DELETE FROM comments WHERE issue_id = :issueId")
                            .setParameter("issueId", issue.getId()).executeUpdate();
                            
                    entityManager.createNativeQuery("DELETE FROM notifications WHERE issue_id = :issueId")
                            .setParameter("issueId", issue.getId()).executeUpdate();
                            
                    entityManager.createNativeQuery("DELETE FROM issue_labels WHERE issue_id = :issueId")
                            .setParameter("issueId", issue.getId()).executeUpdate();
                            
                    entityManager.createNativeQuery("DELETE FROM issue_links WHERE source_issue_id = :issueId OR target_issue_id = :issueId")
                            .setParameter("issueId", issue.getId()).executeUpdate();
                            
                    entityManager.createNativeQuery("DELETE FROM attachments WHERE issue_id = :issueId")
                            .setParameter("issueId", issue.getId()).executeUpdate();
                            
                    // Also delete the issue itself via native query so Hibernate doesn't complain about collections
                    entityManager.createNativeQuery("DELETE FROM issues WHERE id = :issueId")
                            .setParameter("issueId", issue.getId()).executeUpdate();
                }
                
                System.out.println("Deleting report: " + report.getTitle());
                // Delete report via native query to avoid lazy issues
                entityManager.createNativeQuery("DELETE FROM problem_reports WHERE id = :reportId")
                        .setParameter("reportId", report.getId()).executeUpdate();
            }
        }
        System.out.println("Finished deleting Batch Imports.");
    }
}
