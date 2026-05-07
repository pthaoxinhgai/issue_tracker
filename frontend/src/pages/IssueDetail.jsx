import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { issueService } from '../api/issueService';
import { userService } from '../api/userService';
import { MessageSquare, User, Clock, Check, ArrowLeft } from 'lucide-react';

const IssueDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [issue, setIssue] = useState(null);
  const [comments, setComments] = useState([]);
  const [users, setUsers] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    try {
      const [issueData, commentsData, usersData] = await Promise.all([
        issueService.getById(id),
        issueService.getComments(id),
        userService.getAll()
      ]);
      setIssue(issueData);
      setComments(commentsData);
      setUsers(usersData);
    } catch (error) {
      console.error('Failed to fetch data', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    try {
      const added = await issueService.addComment(id, newComment);
      setComments([...comments, added]);
      setNewComment('');
    } catch (error) {
      console.error('Failed to add comment', error);
    }
  };

  const handleAssign = async (e) => {
    const userId = e.target.value;
    if (!userId) return;
    try {
      const updatedIssue = await issueService.assign(id, userId);
      setIssue(updatedIssue);
    } catch (error) {
      console.error('Failed to assign issue', error);
    }
  };

  if (loading) return <div className="text-center p-8">Loading issue details...</div>;
  if (!issue) return <div className="text-center p-8 text-red-400">Issue not found.</div>;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="bg-surface p-6 rounded-xl border border-slate-700 shadow-xl">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h2 className="text-3xl font-bold mb-2">{issue.title}</h2>
            <div className="flex gap-4 text-sm text-slate-400 items-center">
              <span className="flex items-center gap-1"><User size={14}/> {issue.reporter?.name}</span>
              <span className="flex items-center gap-1"><Clock size={14}/> {new Date(issue.createdAt).toLocaleDateString()}</span>
            </div>
          </div>
          <div className="flex flex-col gap-2 items-end">
             <span className="bg-slate-700 px-3 py-1 rounded text-sm font-medium">{issue.status.replace('_', ' ')}</span>
             <span className="text-xs font-bold text-slate-400">{issue.type} | {issue.priority}</span>
          </div>
        </div>
        
        <div className="prose prose-invert max-w-none mb-8">
          <p className="whitespace-pre-wrap">{issue.description || 'No description provided.'}</p>
        </div>
        
        <div className="border-t border-slate-700 pt-4 flex justify-between items-center text-sm">
           <div className="text-slate-400 flex items-center gap-2">
             Assignee: 
             <select 
                value={issue.assignee?.id || ''} 
                onChange={handleAssign}
                className="bg-slate-800 border border-slate-700 text-white text-sm rounded focus:ring-primary focus:border-primary block p-1"
             >
                <option value="" disabled>Unassigned</option>
                {users.map(user => (
                   <option key={user.id} value={user.id}>{user.name}</option>
                ))}
             </select>
           </div>
        </div>
      </div>

      {/* Comments Section */}
      <div className="bg-surface p-6 rounded-xl border border-slate-700 shadow-xl">
        <h3 className="text-xl font-bold flex items-center gap-2 mb-6">
          <MessageSquare size={20} /> Comments ({comments.length})
        </h3>
        
        <div className="space-y-4 mb-6">
          {comments.map(comment => (
            <div key={comment.id} className="bg-slate-800 p-4 rounded border border-slate-700">
              <div className="flex justify-between text-xs text-slate-400 mb-2">
                <span className="font-medium text-slate-300">{comment.user.name}</span>
                <span>{new Date(comment.createdAt).toLocaleString()}</span>
              </div>
              <p className="text-sm whitespace-pre-wrap">{comment.content}</p>
            </div>
          ))}
          {comments.length === 0 && <p className="text-slate-500 text-sm">No comments yet.</p>}
        </div>

        <form onSubmit={handleAddComment} className="mt-4">
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            className="input-field mb-2"
            rows="3"
            placeholder="Add a comment..."
            required
          />
          <div className="flex justify-end">
            <button type="submit" className="btn-primary text-sm">Comment</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default IssueDetail;
