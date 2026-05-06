# Issue Tracker

A full-stack, GitLab-inspired Issue Tracking web application designed to help teams manage their projects using a Kanban board methodology. 

## 🚀 Features

- **User Accounts**: Registration and login system.
- **Issue Management**: Create, read, update, and delete issues (bugs, tasks, features).
- **Kanban Board**: Visual drag-and-drop board for tracking issue statuses (`TODO`, `IN_PROGRESS`, `REVIEW`, `DONE`).
- **Comments**: Add comments and engage in discussions on specific issues.
- **Role-based Access**: Users can be assigned as Assignees or Reporters for various issues.

## 🛠️ Technology Stack

**Frontend**
- React 19
- Vite
- Tailwind CSS v4
- React Router DOM
- Axios
- Lucide React (Icons)

**Backend**
- Java 17+ (Tested up to Java 24)
- Spring Boot 3.2.5
- Spring Data JPA (Hibernate)
- Maven (Maven Wrapper included)
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

### 2. Run the Backend (Spring Boot)
Open a terminal in the `backend` directory:
```bash
cd backend
./mvnw.cmd spring-boot:run
```
The API server will automatically generate the database tables and start on `http://localhost:8080`.

### 3. Run the Frontend (React Vite)
Open a new terminal in the `frontend` directory:
```bash
cd frontend
npm install
npm run dev
```
Navigate to the provided Vite URL (typically `http://localhost:5173`) in your browser to start using the application!
