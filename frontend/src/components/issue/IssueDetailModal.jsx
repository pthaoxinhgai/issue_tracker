import React, { useState, useEffect } from 'react';
import { getIssueById, getComments, getActivities, addComment, deleteIssue, assignIssue } from '../../services/issue.service';
import { getAttachments, uploadAttachment } from '../../services/attachment.service';
import { getAllUsers } from '../../services/user.service';
import { useAuth } from '../../context/AuthContext';
import { X, Trash2, Send, Clock, Activity, MessageSquare, Paperclip, Download, Upload as UploadIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const IssueDetailModal = ({ issueId, onClose }) => {
    const [issue, setIssue] = useState(null);
    const [comments, setComments] = useState([]);
    const [activities, setActivities] = useState([]);
    const [attachments, setAttachments] = useState([]);
    const [users, setUsers] = useState([]);
    const [newComment, setNewComment] = useState('');
    const [loading, setLoading] = useState(true);
    const { user, hasRole } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        fetchData();
    }, [issueId]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [issueData, commentsData, activitiesData, attachmentsData] = await Promise.all([
                getIssueById(issueId),
                getComments(issueId),
                getActivities(issueId),
                getAttachments(issueId)
            ]);
            setIssue(issueData);
            setComments(commentsData);
            setActivities(activitiesData);
            setAttachments(attachmentsData);
            
            if (hasRole(['MAINTAINER'])) {
                const usersData = await getAllUsers();
                setUsers(usersData);
            }
        } catch (error) {
            console.error('Failed to fetch details', error);
        } finally {
            setLoading(false);
        }
    };

    const handleAddComment = async (e) => {
        e.preventDefault();
        if (!newComment.trim()) return;
        try {
            await addComment(issueId, newComment);
            setNewComment('');
            const commentsData = await getComments(issueId);
            setComments(commentsData);
        } catch (error) {
            console.error('Failed to add comment', error);
        }
    };

    const handleDelete = async () => {
        if (!window.confirm('Are you sure you want to delete this issue?')) return;
        try {
            await deleteIssue(issueId);
            onClose();
        } catch (error) {
            console.error('Failed to delete', error);
        }
    };

    const handleAssign = async (e) => {
        const userId = e.target.value;
        if (!userId) return;
        try {
            await assignIssue(issueId, userId);
            fetchData();
        } catch (error) {
            console.error('Failed to assign', error);
        }
    };

    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        try {
            await uploadAttachment(issueId, file);
            const attachmentsData = await getAttachments(issueId);
            setAttachments(attachmentsData);
        } catch (error) {
            console.error('Failed to upload', error);
            alert('Failed to upload file');
        }
    };

    if (loading) return (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex justify-end">
            <div className="w-full max-w-2xl bg-white h-full shadow-2xl p-8 flex items-center justify-center">Loading...</div>
        </div>
    );
    if (!issue) return null;

    return (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex justify-end">
            <div className="w-full max-w-2xl bg-white h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
                {/* Header */}
                <div className="p-6 border-b border-gray-200 flex justify-between items-start sticky top-0 bg-white z-10">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <span className="text-sm font-semibold text-gray-500">#{issue.id}</span>
                            <span className="bg-gray-100 text-gray-700 px-2 py-0.5 rounded text-xs font-bold">{issue.status}</span>
                            <span className="bg-red-50 text-red-700 px-2 py-0.5 rounded text-xs font-bold">{issue.priority}</span>
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900">{issue.title}</h2>
                    </div>
                    <div className="flex items-center gap-2">
                        {hasRole(['MAINTAINER']) && (
                            <button onClick={handleDelete} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors">
                                <Trash2 className="h-5 w-5" />
                            </button>
                        )}
                        <button onClick={onClose} className="p-2 text-gray-400 hover:bg-gray-100 rounded transition-colors">
                            <X className="h-6 w-6" />
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6 space-y-8">
                    
                    <div className="prose prose-sm max-w-none text-gray-700">
                        <p className="whitespace-pre-wrap">{issue.description || 'No description provided.'}</p>
                    </div>

                    <div className="flex gap-8 border-t border-b border-gray-100 py-4">
                        <div>
                            <span className="block text-xs font-semibold text-gray-500 mb-1">CREATOR</span>
                            <span className="text-sm text-gray-900">{issue.creator?.name || issue.creator?.email}</span>
                        </div>
                        <div>
                            <span className="block text-xs font-semibold text-gray-500 mb-1">ASSIGNEE</span>
                            {hasRole(['MAINTAINER']) ? (
                                <select 
                                    className="text-sm bg-gray-50 border border-gray-200 rounded p-1"
                                    value={issue.assignee?.id || ''}
                                    onChange={handleAssign}
                                >
                                    <option value="">Unassigned</option>
                                    {users
                                        .filter(u => u.role === 'DEVELOPER' || u.role === 'MAINTAINER')
                                        .map(u => (
                                        <option key={u.id} value={u.id}>{u.name} ({u.role})</option>
                                    ))}
                                </select>
                            ) : (
                                <span className="text-sm text-gray-900">{issue.assignee?.name || 'Unassigned'}</span>
                            )}
                        </div>
                    </div>

                    {/* Attachments */}
                    <div className="border-b border-gray-100 pb-4">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                                <Paperclip className="h-4 w-4 text-gray-500" />
                                Attachments
                            </h3>
                            {hasRole(['REPORTER', 'DEVELOPER', 'MAINTAINER']) && (
                                <div>
                                    <input 
                                        type="file" 
                                        id="file-upload" 
                                        className="hidden" 
                                        onChange={handleFileUpload}
                                    />
                                    <label htmlFor="file-upload" className="btn-primary text-xs px-3 py-1.5 cursor-pointer flex items-center gap-1">
                                        <UploadIcon size={14} /> Attach File
                                    </label>
                                </div>
                            )}
                        </div>
                        
                        {attachments.length === 0 ? (
                            <p className="text-sm text-gray-500 italic">No attachments yet.</p>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                {attachments.map(att => (
                                    <div key={att.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                                        <div className="flex items-center gap-3 overflow-hidden">
                                            <div className="bg-primary/10 p-2 rounded text-primary">
                                                <Paperclip size={16} />
                                            </div>
                                            <div className="truncate">
                                                <p className="text-sm font-medium text-gray-900 truncate" title={att.fileName}>{att.fileName}</p>
                                                <p className="text-xs text-gray-500">{new Date(att.createdAt).toLocaleDateString()} by {att.uploadedBy.name}</p>
                                            </div>
                                        </div>
                                        <a 
                                            href={`http://localhost:8080${att.fileUrl}`} 
                                            target="_blank" 
                                            rel="noreferrer"
                                            className="p-2 text-gray-400 hover:text-primary hover:bg-primary/10 rounded transition-colors"
                                            title="Download/View"
                                        >
                                            <Download size={16} />
                                        </a>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Tabs area for Comments / Activity */}
                    <div className="space-y-6">
                        <div>
                            <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2 mb-4 border-b border-gray-200 pb-2">
                                <MessageSquare className="h-4 w-4 text-gray-500" />
                                Comments
                            </h3>
                            <div className="space-y-4 mb-4">
                                {comments.map(c => (
                                    <div key={c.id} className="flex gap-3">
                                        <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm shrink-0">
                                            {c.user.name.charAt(0)}
                                        </div>
                                        <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 w-full">
                                            <div className="flex justify-between items-center mb-1">
                                                <span className="font-semibold text-sm text-gray-900">{c.user.name}</span>
                                                <span className="text-xs text-gray-500">{new Date(c.createdAt).toLocaleString()}</span>
                                            </div>
                                            <p className="text-sm text-gray-700 whitespace-pre-wrap">{c.content}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            
                            {hasRole(['REPORTER', 'DEVELOPER', 'MAINTAINER']) && (
                                <form onSubmit={handleAddComment} className="mt-4 flex gap-2">
                                    <input 
                                        type="text"
                                        value={newComment}
                                        onChange={(e) => setNewComment(e.target.value)}
                                        placeholder="Add a comment..."
                                        className="input-field flex-1"
                                    />
                                    <button type="submit" className="btn-primary p-2 flex items-center justify-center shrink-0">
                                        <Send className="h-4 w-4" />
                                    </button>
                                </form>
                            )}
                        </div>

                        <div className="pt-6">
                            <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2 mb-4 border-b border-gray-200 pb-2">
                                <Activity className="h-4 w-4 text-gray-500" />
                                Activity Log
                            </h3>
                            <div className="space-y-3 pl-2 border-l-2 border-gray-100 ml-3">
                                {activities.map(a => (
                                    <div key={a.id} className="relative pl-6">
                                        <div className="absolute w-2 h-2 bg-gray-300 rounded-full -left-[5px] top-1.5 border-2 border-white"></div>
                                        <p className="text-xs text-gray-600">
                                            <span className="font-semibold text-gray-900">{a.user.name}</span> 
                                            {' '}{a.action.replace('_', ' ').toLowerCase()}{' '}
                                            {a.oldValue && <span className="line-through text-gray-400">{a.oldValue}</span>}
                                            {a.oldValue && a.newValue && ' → '}
                                            {a.newValue && <span className="font-medium">{a.newValue}</span>}
                                        </p>
                                        <p className="text-[10px] text-gray-400 mt-0.5 flex items-center gap-1">
                                            <Clock className="h-3 w-3" />
                                            {new Date(a.createdAt).toLocaleString()}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
