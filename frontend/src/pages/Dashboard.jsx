import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { issueService } from '../api/issueService';
import { userService } from '../api/userService';
import { Plus, User } from 'lucide-react';

const Dashboard = () => {
  const [issues, setIssues] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [issuesData, usersData] = await Promise.all([
        issueService.getAll(),
        userService.getAll()
      ]);
      setIssues(issuesData);
      setUsers(usersData);
    } catch (error) {
      console.error('Failed to fetch data', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAssign = async (issueId, userId) => {
    try {
      const updatedIssue = await issueService.assign(issueId, userId);
      setIssues(issues.map(issue => 
        issue.id === issueId ? updatedIssue : issue
      ));
    } catch (error) {
      console.error('Failed to assign issue', error);
    }
  };

  const getStatusStyle = (status) => {
    const styles = {
      'TODO': 'bg-[#313d4a] text-[#adbac7]',
      'IN_PROGRESS': 'bg-[#0c2d6b] text-[#579dff]',
      'REVIEW': 'bg-[#3d2e00] text-[#ffab00]',
      'DONE': 'bg-[#1c3329] text-[#57d9a3]'
    };
    return styles[status] || 'bg-slate-700 text-slate-300';
  };

  const getPriorityStyle = (priority) => {
    const styles = {
      'LOW': 'text-green-500',
      'MEDIUM': 'text-yellow-500',
      'HIGH': 'text-red-500'
    };
    return styles[priority] || 'text-slate-400';
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Issues</h2>
          <p className="text-sm text-slate-500">Manage and track your team's work</p>
        </div>
        <Link to="/issue/new" className="btn-primary">
          Create Issue
        </Link>
      </div>

      <div className="bg-[#1c2128] rounded-lg border border-border overflow-hidden shadow-sm">
        {loading ? (
          <div className="p-12 text-center text-slate-500 text-sm">Loading issues...</div>
        ) : issues.length === 0 ? (
           <div className="p-12 text-center text-slate-500 text-sm">No issues found. <Link to="/issue/new" className="text-primary hover:underline">Create one</Link></div>
        ) : (
          <table className="w-full text-left border-collapse table-auto">
            <thead>
              <tr className="bg-[#22272e] border-b border-border text-[#768390] text-xs uppercase tracking-wider">
                <th className="p-4 font-semibold">Key</th>
                <th className="p-4 font-semibold w-1/2">Summary</th>
                <th className="p-4 font-semibold">Status</th>
                <th className="p-4 font-semibold">Priority</th>
                <th className="p-4 font-semibold">Assignee</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {issues.map(issue => (
                <tr key={issue.id} className="border-b border-border hover:bg-[#22272e] transition-colors group">
                  <td className="p-4 text-xs font-mono text-slate-500">
                    ISS-{issue.id}
                  </td>
                  <td className="p-4">
                    <Link to={`/issue/${issue.id}`} className="font-medium text-[#adbac7] hover:text-primary transition-colors block">
                      {issue.title}
                    </Link>
                  </td>
                  <td className="p-4">
                    <span className={`${getStatusStyle(issue.status)} text-[10px] font-bold uppercase px-2 py-0.5 rounded`}>
                      {issue.status.replace('_', ' ')}
                    </span>
                  </td>
                  <td className={`p-4 font-medium text-xs ${getPriorityStyle(issue.priority)}`}>
                    {issue.priority}
                  </td>
                  <td className="p-4">
                    <select 
                      value={issue.assignee?.id || ''} 
                      onChange={(e) => handleAssign(issue.id, e.target.value)}
                      className="bg-transparent border-none text-[#adbac7] text-xs rounded focus:ring-0 block p-0 w-full outline-none cursor-pointer hover:text-white transition-colors"
                    >
                      <option value="" className="bg-[#1c2128]">Unassigned</option>
                      {users.map(user => (
                        <option key={user.id} value={user.id} className="bg-[#1c2128]">{user.name}</option>
                      ))}
                    </select>
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
