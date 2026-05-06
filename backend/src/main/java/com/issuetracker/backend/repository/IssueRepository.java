package com.issuetracker.backend.repository;

import com.issuetracker.backend.domain.entity.Issue;
import org.springframework.data.jpa.repository.JpaRepository;

public interface IssueRepository extends JpaRepository<Issue, Long> {
}
