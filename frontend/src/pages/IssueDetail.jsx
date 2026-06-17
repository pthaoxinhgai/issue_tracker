import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { issueService } from '../api/issueService';
import { userService } from '../api/userService';
import { getAttachments, uploadAttachment } from '../services/attachment.service';
import { MessageSquare, User, Clock, Check, ArrowLeft, Paperclip, Download, Upload as UploadIcon } from 'lucide-react';

const IssueDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [issue, setIssue] = useState(null);
  const [comments, setComments] = useState([]);
  const [attachments, setAttachments] = useState([]);
  const [users, setUsers] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    try {
      const [issueData, commentsData, usersData, attachmentsData] = await Promise.all([
        issueService.getById(id),
        issueService.getComments(id),
        userService.getAll(),
        getAttachments(id)
      ]);
      setIssue(issueData);
      setComments(commentsData);
      setUsers(usersData);
      setAttachments(attachmentsData);
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

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      await uploadAttachment(id, file);
      const attachmentsData = await getAttachments(id);
      setAttachments(attachmentsData);
    } catch (error) {
      console.error('Failed to upload', error);
      alert('Failed to upload file');
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
              <span className="flex items-center gap-1"><User size={14}/> {issue.creator?.name || issue.creator?.email}</span>
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
                {users
                    .filter(user => user.role === 'DEVELOPER' || user.role === 'MAINTAINER')
                    .map(user => (
                   <option key={user.id} value={user.id}>{user.name} ({user.role})</option>
                ))}
             </select>
           </div>
        </div>
      </div>

      {/* Attachments Section */}
      <div className="bg-surface p-6 rounded-xl border border-slate-700 shadow-xl">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold flex items-center gap-2">
            <Paperclip size={20} /> Attachments ({attachments.length})
          </h3>
          <div>
            <input 
                type="file" 
                id="file-upload" 
                className="hidden" 
                onChange={handleFileUpload}
            />
            <label htmlFor="file-upload" className="btn-primary text-sm px-4 py-2 cursor-pointer flex items-center gap-2">
                <UploadIcon size={16} /> Attach File
            </label>
          </div>
        </div>
        
        {attachments.length === 0 ? (
          <p className="text-slate-500 text-sm italic">No attachments yet.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {attachments.map(att => (
              <div key={att.id} className="flex items-center justify-between p-4 bg-slate-800 border border-slate-700 rounded-lg hover:border-slate-500 transition-colors">
                <div className="flex items-center gap-3 overflow-hidden">
                  <div className="bg-primary/20 p-2 rounded text-primary shrink-0">
                    <Paperclip size={20} />
                  </div>
                  <div className="truncate">
                    <p className="text-sm font-semibold text-slate-200 truncate" title={att.fileName}>{att.fileName}</p>
                    <p className="text-xs text-slate-400">{new Date(att.createdAt).toLocaleDateString()} by {att.uploadedBy.name}</p>
                  </div>
                </div>
                <a 
                  href={`http://localhost:8080${att.fileUrl}`} 
                  target="_blank" 
                  rel="noreferrer"
                  className="p-2 text-slate-400 hover:text-primary transition-colors shrink-0"
                  title="Download/View"
                >
                  <Download size={20} />
                </a>
              </div>
            ))}
          </div>
        )}
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
