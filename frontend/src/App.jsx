import React from 'react';
import { Routes, Route, Navigate, Link, useNavigate, useLocation } from 'react-router-dom';
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
  const location = useLocation();
  const user = JSON.parse(localStorage.getItem('user'));

  const handleLogout = () => {
    localStorage.removeItem('user');
    navigate('/login');
  };

  const navItems = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard },
    { name: 'Kanban Board', path: '/kanban', icon: KanbanSquare }
  ];

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-background">
      {/* Sidebar */}
      <aside className="w-full md:w-60 bg-[#1c2128] border-r border-border hidden md:flex flex-col">
        <div className="p-5">
          <h1 className="text-lg font-bold text-primary flex items-center gap-2">
            <span className="w-6 h-6 bg-primary rounded flex items-center justify-center text-background">I</span>
            Issue Tracker
          </h1>
        </div>
        <nav className="flex-1 px-3 space-y-1">
          {navItems.map(item => (
            <Link 
              key={item.path}
              to={item.path} 
              className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-all ${
                location.pathname === item.path 
                ? 'bg-[#313d4a] text-white font-medium' 
                : 'text-[#adbac7] hover:bg-[#22272e] hover:text-white'
              }`}
            >
              <item.icon size={16} className={location.pathname === item.path ? 'text-primary' : 'text-slate-500'} />
              {item.name}
            </Link>
          ))}
        </nav>
        <div className="p-4 border-t border-border flex items-center justify-between group">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-xs font-bold text-white">
              {user?.name?.charAt(0)}
            </div>
            <span className="text-sm font-medium text-[#adbac7] truncate max-w-[100px]">{user?.name}</span>
          </div>
          <button onClick={handleLogout} className="text-slate-500 hover:text-red-400 p-1 rounded hover:bg-red-400/10 transition-all">
            <LogOut size={16} />
          </button>
        </div>
      </aside>

      {/* Mobile Nav */}
      <div className="md:hidden flex items-center justify-between p-4 bg-[#1c2128] border-b border-border">
         <h1 className="text-lg font-bold text-primary">Issue Tracker</h1>
         <button onClick={handleLogout} className="text-slate-500"><LogOut size={18} /></button>
      </div>

      {/* Main Content */}
      <main className="flex-1 p-4 md:p-6 overflow-auto">
        <div className="max-w-[1600px] mx-auto">
          {children}
        </div>
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
