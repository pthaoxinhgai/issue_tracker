import React from 'react';
import { Routes, Route, Navigate, Link, useNavigate } from 'react-router-dom';
import { LayoutDashboard, KanbanSquare, LogOut } from 'lucide-react';

// Placeholder imports
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import KanbanBoard from './pages/KanbanBoard';
import IssueDetail from './pages/IssueDetail';
import CreateIssue from './pages/CreateIssue';

const PrivateRoute = ({ children }) => {
  const user = localStorage.getItem('user');
  return user ? children : <Navigate to="/login" />;
};

const Layout = ({ children }) => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user'));

  const handleLogout = () => {
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-surface border-r border-slate-700 hidden md:flex flex-col">
        <div className="p-4 border-b border-slate-700">
          <h1 className="text-xl font-bold text-primary flex items-center gap-2">
            <KanbanSquare /> Issue Tracker
          </h1>
        </div>
        <nav className="flex-1 p-4 space-y-2">
          <Link to="/" className="flex items-center gap-2 p-2 rounded hover:bg-slate-700 transition-colors">
            <LayoutDashboard size={18} /> Dashboard
          </Link>
          <Link to="/kanban" className="flex items-center gap-2 p-2 rounded hover:bg-slate-700 transition-colors">
            <KanbanSquare size={18} /> Kanban Board
          </Link>
        </nav>
        <div className="p-4 border-t border-slate-700 text-sm flex items-center justify-between">
          <span>{user?.name}</span>
          <button onClick={handleLogout} className="text-red-400 hover:text-red-300">
            <LogOut size={18} />
          </button>
        </div>
      </aside>

      {/* Mobile Nav */}
      <div className="md:hidden flex items-center justify-between p-4 bg-surface border-b border-slate-700">
         <h1 className="text-xl font-bold text-primary">Issue Tracker</h1>
         <button onClick={handleLogout} className="text-red-400"><LogOut size={18} /></button>
      </div>

      {/* Main Content */}
      <main className="flex-1 p-4 md:p-8 overflow-auto">
        {children}
      </main>
    </div>
  );
};

const App = () => {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/" element={<PrivateRoute><Layout><Dashboard /></Layout></PrivateRoute>} />
      <Route path="/kanban" element={<PrivateRoute><Layout><KanbanBoard /></Layout></PrivateRoute>} />
      <Route path="/issue/new" element={<PrivateRoute><Layout><CreateIssue /></Layout></PrivateRoute>} />
      <Route path="/issue/:id" element={<PrivateRoute><Layout><IssueDetail /></Layout></PrivateRoute>} />
    </Routes>
  );
};

export default App;
