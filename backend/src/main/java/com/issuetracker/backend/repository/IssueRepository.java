package com.issuetracker.backend.repository;

import com.issuetracker.backend.domain.entity.Issue;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.EntityGraph;
import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface IssueRepository extends JpaRepository<Issue, Long> {

    @EntityGraph(attributePaths = {"assignee", "creator", "labels"})
    List<Issue> findAll();

    @EntityGraph(attributePaths = {"assignee", "creator", "labels"})
    Optional<Issue> findById(Long id);

    @EntityGraph(attributePaths = {"assignee", "creator", "labels"})
    @Query("SELECT i FROM Issue i WHERE " +
           "(:status IS NULL OR i.status = :status) AND " +
           "(:assigneeId IS NULL OR i.assignee.id = :assigneeId) AND " +
           "(:priority IS NULL OR i.priority = :priority)")
    List<Issue> findFilteredIssues(@Param("status") com.issuetracker.backend.domain.enums.IssueStatus status,
                                   @Param("assigneeId") Long assigneeId,
                                   @Param("priority") com.issuetracker.backend.domain.enums.Priority priority);

    @EntityGraph(attributePaths = {"assignee", "creator", "labels"})
    @Query("SELECT i FROM Issue i WHERE LOWER(i.title) LIKE LOWER(CONCAT('%', :query, '%')) OR LOWER(i.description) LIKE LOWER(CONCAT('%', :query, '%'))")
    List<Issue> searchIssues(@Param("query") String query);
}
