package com.issuetracker.backend.repository;

import com.issuetracker.backend.domain.entity.Issue;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.EntityGraph;
import java.util.List;
import java.util.Optional;

public interface IssueRepository extends JpaRepository<Issue, Long> {

    @EntityGraph(attributePaths = {"assignee", "reporter"})
    List<Issue> findAll();

    @EntityGraph(attributePaths = {"assignee", "reporter"})
    Optional<Issue> findById(Long id);
}
