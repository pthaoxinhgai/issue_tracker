import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute } from './components/layout/ProtectedRoute';
import { Navbar } from './components/layout/Navbar';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { Kanban } from './pages/Kanban';
import IssueDetail from './pages/IssueDetail';
import { Reports } from './pages/Reports';
import { CreateReport } from './pages/CreateReport';
import { ReportDetail } from './pages/ReportDetail';
import { UserManagement } from './pages/UserManagement';
import './index.css';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-background flex flex-col">
          <Navbar />
          <main className="flex-1">
            <Routes>
              <Route path="/login" element={<Login />} />
              
              {/* Protected Routes */}
              <Route element={<ProtectedRoute />}>
                <Route path="/" element={<Dashboard />} />
                <Route path="/board" element={<Kanban />} />
                <Route path="/issue/:id" element={<IssueDetail />} />
                <Route path="/reports" element={<Reports />} />
                <Route path="/reports/new" element={<CreateReport />} />
                <Route path="/reports/:id" element={<ReportDetail />} />
                <Route path="/users" element={<UserManagement />} />
              </Route>
              
              {/* Fallback */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
