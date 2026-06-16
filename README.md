# Problem Lifecycle Management System

A full-stack, enterprise-grade Problem Lifecycle Management System designed to systematically bridge the gap between problem reporting and developer task execution.

## 🚀 System Analysis & Workflow

This system goes beyond a basic Issue Tracker by modeling the complete lifecycle of a problem from its inception to its resolution using a rigorous **Problem Report $\rightarrow$ Issue** pipeline.

### Core Architecture
The system fundamentally separates **Reports** (what the user experiences) from **Issues** (how the engineering team solves it).
1. **ProblemReport Module**: Acts as the single source of truth for incoming problems. 
2. **Issue Module**: Derivative, actionable engineering tasks linked to a `ProblemReport`.
3. **Polymorphic Interactions**: Both `Comments` and `ActivityLogs` are polymorphically attached to both Reports and Issues, ensuring a seamless audit trail across the entire lifecycle.
4. **Real-time Notifications**: Developers are immediately notified via a notification bell when they are assigned new issues.

### Role-Based Access Control (RBAC)

The system enforces strict access boundaries across three distinct roles:

- **`REPORTER`**: The initiator. Can submit new Problem Reports, view their own reports, and communicate via comments. They *cannot* access the internal Kanban board or Issue lists.
- **`MAINTAINER`**: The triager and manager. Has full visibility. They review incoming Problem Reports, classify or reject them, spawn actionable `Issues` from valid reports, assign them to Developers, and oversee the Kanban board.
- **`DEVELOPER`**: The executor. Focuses exclusively on the engineering side. They have access to the Kanban board, can be assigned to `Issues`, and are responsible for moving tasks from `OPEN` $\rightarrow$ `IN_PROGRESS` $\rightarrow$ `REVIEW` $\rightarrow$ `DONE`.

### The Problem Lifecycle

1. **Submission**: A `REPORTER` submits a Problem Report (Status: `NEW`).
2. **Triage**: A `MAINTAINER` reviews the report (Status shifts to `UNDER_REVIEW`).
3. **Classification**: The `MAINTAINER` either marks the report as `REJECTED` or `CLASSIFIED`.
4. **Issue Spawning**: If `CLASSIFIED`, the `MAINTAINER` spawns one or multiple `Issues` from the report and assigns them to `DEVELOPER`s.
5. **Execution**: `DEVELOPER`s work on the Issues via the Kanban board (Status: `OPEN` $\rightarrow$ `DONE`).
6. **Resolution**: Once all derivative Issues are completed, the original Problem Report is marked as `RESOLVED`.

## 🛠️ Technology Stack

**Frontend**
- React 19 + Vite
- Tailwind CSS v4
- React Router DOM
- Axios + Lucide React (Icons)
- @hello-pangea/dnd (Drag and drop Kanban)

**Backend**
- Java 17+ (Spring Boot 3.2.5)
- Spring Security (JWT Authentication & Method-level Security)
- Spring Data JPA (Hibernate)
- MySQL Database

## ⚙️ Prerequisites
- Node.js (v18+)
- Java JDK 17+
- Local MySQL Server (running on port `3306`)

## 🏃‍♂️ Getting Started

### 1. Database Setup
Ensure your local MySQL server is running. Log in and create the database:
```sql
CREATE DATABASE IF NOT EXISTS issue_tracker;
```
*(Note: Ensure your MySQL username is `root` and password is `123456`. If different, update `backend/src/main/resources/application.properties`)*

### 2. Run the Backend
```bash
cd backend
./mvnw.cmd spring-boot:run
```
The API server will automatically generate the database tables and start on `http://localhost:8080`.

### 3. Run the Frontend
```bash
cd frontend
npm install
npm run dev
```
Navigate to `http://localhost:5173` to start using the application!
