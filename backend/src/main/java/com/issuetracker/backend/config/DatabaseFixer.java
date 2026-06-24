package com.issuetracker.backend.config;

import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

@Component
public class DatabaseFixer {

    @Autowired
    private JdbcTemplate jdbcTemplate;

    @PostConstruct
    public void fixDatabase() {
        try {
            System.out.println("Executing raw SQL to fix enum constraints in database...");
            jdbcTemplate.execute("UPDATE users SET role='ADMIN' WHERE role='MAINTAINER'");
            jdbcTemplate.execute("UPDATE users SET role='SUPPORT_STAFF' WHERE role IN ('REPORTER', 'GUEST')");
            jdbcTemplate.execute("UPDATE issues SET status='NEW' WHERE status='OPEN'");
            jdbcTemplate.execute("UPDATE issues SET status='READY_FOR_QA' WHERE status='REVIEW'");
            jdbcTemplate.execute("UPDATE issues SET status='RESOLVED' WHERE status='DONE'");
            
            try {
                jdbcTemplate.execute("ALTER TABLE users DROP COLUMN role_id");
            } catch (Exception e) {
                try {
                    jdbcTemplate.execute("ALTER TABLE users MODIFY role_id BIGINT NULL");
                } catch (Exception ex) {
                    System.err.println("Could not drop or modify role_id: " + ex.getMessage());
                }
            }
            
            // Phase 9 migrations
            jdbcTemplate.execute("UPDATE issues SET type='FEATURE_REQUEST' WHERE type='FEATURE'");
            jdbcTemplate.execute("UPDATE issues SET priority='URGENT' WHERE priority='CRITICAL'");
            jdbcTemplate.execute("UPDATE issues SET severity='S4' WHERE severity IN ('TRIVIAL', 'MINOR')");
            jdbcTemplate.execute("UPDATE issues SET severity='S3' WHERE severity='MAJOR'");
            jdbcTemplate.execute("UPDATE issues SET severity='S2' WHERE severity='CRITICAL'");
            jdbcTemplate.execute("UPDATE issues SET severity='S1' WHERE severity='BLOCKER'");
            
            System.out.println("Raw SQL execution completed successfully.");
        } catch (Exception e) {
            System.err.println("Failed to execute raw SQL: " + e.getMessage());
        }
    }
}
