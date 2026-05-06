import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { issueService } from '../api/issueService';
import { Plus } from 'lucide-react';

const Dashboard = () => {
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchIssues();
  }, []);

  const fetchIssues = async () => {
    try {
      const data = await issueService.getAll();
      setIssues(data);
    } catch (error) {
      console.error('Failed to fetch issues', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      'TODO': 'bg-slate-500',
      'IN_PROGRESS': 'bg-blue-500',
      'REVIEW': 'bg-yellow-500',
      'DONE': 'bg-green-500'
    };
    return colors[status] || 'bg-gray-500';
  };

  const getPriorityColor = (priority) => {
    const colors = {
      'LOW': 'text-green-400',
      'MEDIUM': 'text-yellow-400',
      'HIGH': 'text-red-400'
    };
    return colors[priority] || 'text-gray-400';
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Issues Dashboard</h2>
        <Link to="/issue/new" className="btn-primary flex items-center gap-2">
          <Plus size={18} /> New Issue
        </Link>
      </div>

      <div className="bg-surface rounded-xl border border-slate-700 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-slate-400">Loading issues...</div>
        ) : issues.length === 0 ? (
           <div className="p-8 text-center text-slate-400">No issues found. Create one!</div>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-800/50 border-b border-slate-700 text-slate-400">
                <th className="p-4 font-medium">Title</th>
                <th className="p-4 font-medium">Type</th>
                <th className="p-4 font-medium">Status</th>
                <th className="p-4 font-medium">Priority</th>
                <th className="p-4 font-medium">Assignee</th>
              </tr>
            </thead>
            <tbody>
              {issues.map(issue => (
                <tr key={issue.id} className="border-b border-slate-700/50 hover:bg-slate-800/30 transition-colors">
                  <td className="p-4">
                    <Link to={`/issue/${issue.id}`} className="font-medium hover:text-primary transition-colors">
                      {issue.title}
                    </Link>
                  </td>
                  <td className="p-4 text-sm">{issue.type}</td>
                  <td className="p-4">
                    <span className={`${getStatusColor(issue.status)} text-xs px-2 py-1 rounded-full text-white font-medium`}>
                      {issue.status.replace('_', ' ')}
                    </span>
                  </td>
                  <td className={`p-4 font-medium text-sm ${getPriorityColor(issue.priority)}`}>
                    {issue.priority}
                  </td>
                  <td className="p-4 text-sm text-slate-300">
                    {issue.assignee ? issue.assignee.name : 'Unassigned'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
