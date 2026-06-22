package com.issuetracker.backend.security;

import com.issuetracker.backend.domain.entity.Issue;
import com.issuetracker.backend.domain.entity.User;
import com.issuetracker.backend.domain.enums.Role;
import com.issuetracker.backend.repository.IssueRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;

@Service("issueSecurity")
@RequiredArgsConstructor
public class IssueSecurityService {

    private final IssueRepository issueRepository;

    public boolean canUpdateIssue(Authentication authentication, Long issueId) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return false;
        }

        User user = (User) authentication.getPrincipal();
        Role role = user.getRole();

        if (role == Role.ADMIN || role == Role.SUPPORT_STAFF || role == Role.PRODUCT_OWNER || role == Role.ENGINEERING_MANAGER) {
            return true;
        }

        Issue issue = issueRepository.findById(issueId).orElse(null);
        if (issue == null) {
            return false; // let 404 be handled by the controller
        }

        if (role == Role.DEVELOPER || role == Role.QA) {
            return issue.getAssignee() != null && issue.getAssignee().getId().equals(user.getId());
        }

        return false;
    }
}
