# Enterprise Issue Tracker

## System Overview
The Enterprise Issue Tracker is a comprehensive, full-stack application designed to manage, track, and resolve software issues and customer tickets. It bridges the gap between Support, Product, Engineering, and QA teams through a strict state machine workflow, ensuring that no issue is lost or delayed.

The system is built with a robust Role-Based Access Control (RBAC) model, automated Service Level Agreement (SLA) monitoring, and a full audit trail for enterprise accountability.

## Core Features

1. Role-Based Access Control (RBAC)
   - Granular permissions based on user roles: ADMIN, PRODUCT_OWNER, ENGINEERING_MANAGER, DEVELOPER, QA, SUPPORT_STAFF, and REPORTER.
   - Restricts state transitions and data visibility based on the user's role.

2. Strict State Machine Workflow
   - Issues must follow a predefined lifecycle: NEW -> TRIAGED -> ESCALATED -> ASSIGNED -> IN_PROGRESS -> READY_FOR_QA -> RESOLVED -> CLOSED.
   - Prevents invalid transitions and enforces business logic (e.g., only QA can move an issue to CLOSED).

3. SLA Monitoring and Proactive Warnings
   - Automatically calculates deadlines based on issue Severity (Critical = 2H, High = 8H, Medium = 24H, Low = 48H).
   - Background cron jobs continuously monitor active issues and trigger proactive warnings or breach alerts.

4. Intake and Triage Center
   - Support for bulk importing issues via CSV/Excel.
   - Triage capabilities to classify problems, assign priority, and set severity before escalating to engineering teams.

5. Escalation Management
   - Formal escalation workflows to pass critical support tickets to Product Owners or Engineering Managers.
   - Includes mandatory impact assessments and evidence collection.

6. Kanban Board
   - Visual drag-and-drop board mapping to the 8 system states.
   - Real-time filtering by Priority, Type, and a quick "Only My Issues" toggle.
   - Enforced backend validation to prevent unauthorized drag-and-drop actions.

7. Analytics Command Center (Dashboard)
   - High-level overview of system health.
   - Real-time metrics including Total Active Issues, Unassigned tickets, SLA Breaches, and status distributions.
   - Proactive SLA Watch section highlighting issues approaching their deadline.

8. Comprehensive Audit Trail
   - Immutable activity logs tracking every change made to an issue.
   - Captures previous and new values for critical fields like Status, Assignee, Priority, and Severity.

9. Collaboration System
   - Public comments for cross-team communication.
   - Highlighted Internal Notes strictly for internal team usage.
   - "@" mention system to directly notify team members.

10. Notification Center
    - Real-time alerts for mentions, status changes, assignments, and SLA warnings.
    - Centralized bell icon to track unread notifications.

11. QA Verification Module
    - Dedicated workflow step for Quality Assurance teams to verify developer fixes before final closure.

12. Attachment Management
    - Ability to upload and manage logs, screenshots, and evidence files directly linked to an issue.

## Issue Lifecycle Workflow

The system enforces the following linear workflow. Reopening an issue sends it back to the beginning of the cycle.

1. NEW: The issue is created (manually or imported) but has not been reviewed.
2. TRIAGED: Support or Product teams have reviewed the issue, assigned metadata (Type, Severity), and confirmed it is valid.
3. ESCALATED: The issue requires engineering attention and is sent to the Engineering Manager.
4. ASSIGNED: The Engineering Manager assigns the issue to a specific Developer.
5. IN_PROGRESS: The Developer begins working on the code fix.
6. READY_FOR_QA: The Developer has completed the fix and hands it over to QA for testing.
7. RESOLVED: QA has verified the fix works in a staging/testing environment.
8. CLOSED: The issue is deployed to production and the ticket is officially finalized.

## Architecture

- Frontend: React.js with Tailwind CSS (Dark/Light mode support).
- Backend: Java Spring Boot with Spring Security and Spring Data JPA.
- Database: Relational Database (SQL).
- Automation: Spring Scheduling for background SLA jobs.
