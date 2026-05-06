import React, { useEffect, useState } from 'react';
import { issueService } from '../api/issueService';
import { Link } from 'react-router-dom';

const KanbanBoard = () => {
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

  const moveIssue = async (id, newStatus) => {
    try {
      await issueService.update(id, { status: newStatus });
      fetchIssues(); // Refresh board
    } catch (error) {
      console.error('Failed to update status', error);
      alert(error.response?.data?.message || 'Failed to update status');
    }
  };

  const columns = [
    { title: 'To Do', status: 'TODO', next: 'IN_PROGRESS', prev: null, color: 'border-slate-500' },
    { title: 'In Progress', status: 'IN_PROGRESS', next: 'REVIEW', prev: null, color: 'border-blue-500' },
    { title: 'Review', status: 'REVIEW', next: 'DONE', prev: 'IN_PROGRESS', color: 'border-yellow-500' },
    { title: 'Done', status: 'DONE', next: null, prev: null, color: 'border-green-500' }
  ];

  if (loading) return <div className="text-center p-8 text-slate-400">Loading Kanban Board...</div>;

  return (
    <div className="h-full flex flex-col">
      <h2 className="text-2xl font-bold mb-6">Kanban Board</h2>
      
      <div className="flex-1 overflow-x-auto">
        <div className="flex gap-6 min-w-max h-full pb-4">
          {columns.map(col => {
            const colIssues = issues.filter(i => i.status === col.status);
            return (
              <div key={col.status} className="w-80 bg-surface rounded-xl flex flex-col border border-slate-700/50">
                <div className={`p-4 font-bold border-t-4 ${col.color} rounded-t-xl bg-slate-800/30 flex justify-between items-center`}>
                  <span>{col.title}</span>
                  <span className="bg-slate-700 text-xs px-2 py-1 rounded-full">{colIssues.length}</span>
                </div>
                
                <div className="flex-1 p-4 overflow-y-auto space-y-4">
                  {colIssues.map(issue => (
                    <div key={issue.id} className="bg-slate-800 p-4 rounded border border-slate-700 hover:border-slate-600 transition-colors shadow-lg group">
                      <Link to={`/issue/${issue.id}`} className="font-medium text-primary hover:underline block mb-2">
                        {issue.title}
                      </Link>
                      
                      <div className="flex justify-between items-center mt-4">
                        <span className="text-xs bg-slate-700 px-2 py-1 rounded text-slate-300">
                          {issue.type}
                        </span>
                        
                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          {col.prev && (
                             <button onClick={() => moveIssue(issue.id, col.prev)} className="text-xs bg-slate-600 hover:bg-slate-500 px-2 py-1 rounded transition-colors">
                               &larr;
                             </button>
                          )}
                          {col.next && (
                            <button onClick={() => moveIssue(issue.id, col.next)} className="text-xs bg-primary hover:bg-primaryHover text-white px-2 py-1 rounded transition-colors">
                              Move to {columns.find(c => c.status === col.next)?.title} &rarr;
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                  {colIssues.length === 0 && (
                     <div className="text-center text-slate-500 text-sm py-4 border-2 border-dashed border-slate-700 rounded">
                        Drop items here
                     </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default KanbanBoard;
