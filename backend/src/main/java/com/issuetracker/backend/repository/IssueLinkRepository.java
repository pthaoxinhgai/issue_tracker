package com.issuetracker.backend.repository;

import com.issuetracker.backend.domain.entity.IssueLink;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface IssueLinkRepository extends JpaRepository<IssueLink, Long> {
    List<IssueLink> findBySourceIssueId(Long sourceIssueId);
    List<IssueLink> findByTargetIssueId(Long targetIssueId);
    int countByTargetIssueIdAndLinkType(Long targetIssueId, String linkType);
}
