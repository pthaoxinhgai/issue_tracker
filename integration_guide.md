# Issue Tracker Integration Guide

This guide explains how to start and integrate the Frontend and Backend of the Issue Tracker Web Application.

## Prerequisites
- Java 17+
- Maven
- Node.js (v18+)
- MySQL Server

## 1. Database Setup
Ensure you have MySQL running locally on port `3306`.
1. Log into your MySQL server as `root` (password: `root` - configured in `application.properties`).
2. Run the following command to create the database:
   ```sql
   CREATE DATABASE IF NOT EXISTS issue_tracker;
   ```
   *(Note: Spring Boot is configured to do this automatically via `createDatabaseIfNotExist=true` in the URL, but it is good to verify).*
3. Spring Data JPA will automatically generate the schema (`users`, `issues`, `comments`) upon startup.

## 2. Starting the Backend (Spring Boot)
1. Open a terminal and navigate to the backend directory:
   ```bash
   cd issue-tracker/backend
   ```
2. Build and run the application using Maven:
   ```bash
   mvn spring-boot:run
   ```
3. The backend will start on `http://localhost:8080`.
   - The API is available under `/api/*`.

## 3. Starting the Frontend (React Vite)
1. Open a new terminal and navigate to the frontend directory:
   ```bash
   cd issue-tracker/frontend
   ```
2. Install the dependencies (if you haven't already):
   ```bash
   npm install
   ```
3. Start the Vite development server:
   ```bash
   npm run dev
   ```
4. Open your browser and navigate to the URL provided by Vite (usually `http://localhost:5173`).

## 4. Usage Workflow
1. **Register**: Go to the login page and click "Sign Up" to create an account.
2. **Dashboard**: View the list of all issues.
3. **Create Issue**: Click "New Issue" on the dashboard to report a bug or task.
4. **Kanban Board**: Navigate to the Kanban Board to see issues grouped by status. You can move issues between columns here (TODO → IN_PROGRESS → REVIEW → DONE).
5. **Issue Detail**: Click on any issue title to view its details and add comments.
