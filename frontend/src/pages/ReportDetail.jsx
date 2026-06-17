import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { reportService } from '../services/report.service';
import { projectService } from '../services/project.service';
import { useAuth } from '../context/AuthContext';
import { MessageSquare, User, Clock, ArrowLeft, Loader2, Play } from 'lucide-react';

export const ReportDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    
    const [report, setReport] = useState(null);
    const [comments, setComments] = useState([]);
    const [activities, setActivities] = useState([]);
    const [newComment, setNewComment] = useState('');
    const [loading, setLoading] = useState(true);
    const [isCreatingIssue, setIsCreatingIssue] = useState(false);
    
    // For creating issue
    const [issueData, setIssueData] = useState({
        title: '',
        description: '',
        type: 'TASK',
        priority: 'MEDIUM',
        severity: 'MINOR',
        projectId: ''
    });
    const [projects, setProjects] = useState([]);

    useEffect(() => {
        fetchData();
    }, [id]);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [reportData, commentsData, activitiesData, projectsData] = await Promise.all([
                reportService.getReportById(id),
                reportService.getComments(id),
                reportService.getActivities(id),
                projectService.getAll()
            ]);
            setReport(reportData);
            setComments(commentsData);
            setActivities(activitiesData);
            setProjects(projectsData);
            
            // Pre-fill issue data
            setIssueData(prev => ({
                ...prev,
                title: `[From Report #${reportData.id}] ${reportData.title}`,
                description: reportData.description,
                projectId: projectsData.length > 0 ? projectsData[0].id : ''
            }));
        } catch (error) {
            console.error('Failed to fetch report data', error);
        } finally {
            setLoading(false);
        }
    };

    const handleStatusChange = async (newStatus) => {
        try {
            const updated = await reportService.changeStatus(id, newStatus);
            setReport(updated);
            const activitiesData = await reportService.getActivities(id);
            setActivities(activitiesData);
        } catch (error) {
            console.error('Failed to change status', error);
        }
    };

    const handleAddComment = async (e) => {
        e.preventDefault();
        if (!newComment.trim()) return;
        try {
            const added = await reportService.addComment(id, newComment);
            setComments([...comments, added]);
            setNewComment('');
        } catch (error) {
            console.error('Failed to add comment', error);
        }
    };

    const handleCreateIssue = async (e) => {
        e.preventDefault();
        try {
            await reportService.createIssueFromReport(id, issueData);
            setIsCreatingIssue(false);
            // Optionally redirect to board, or just show success
            handleStatusChange('CLASSIFIED'); // update report status
        } catch (error) {
            console.error('Failed to create issue', error);
        }
    };

    const getStatusColor = (status) => {
        const colors = {
            'NEW': 'bg-blue-100 text-blue-800',
            'UNDER_REVIEW': 'bg-yellow-100 text-yellow-800',
            'CLASSIFIED': 'bg-purple-100 text-purple-800',
            'REJECTED': 'bg-red-100 text-red-800',
            'RESOLVED': 'bg-green-100 text-green-800'
        };
        return colors[status] || 'bg-gray-100 text-gray-800';
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    if (!report) return <div className="text-center p-8 text-red-500 font-medium">Report not found.</div>;

    return (
        <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
            <button 
                onClick={() => navigate('/reports')}
                className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 transition-colors"
            >
                <ArrowLeft className="h-4 w-4" /> Back to Reports
            </button>

            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                <div className="flex justify-between items-start mb-6">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <span className="text-gray-400 font-mono text-sm">#{report.id}</span>
                            <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${getStatusColor(report.status)}`}>
                                {report.status.replace('_', ' ')}
                            </span>
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-3">{report.title}</h2>
                        <div className="flex gap-4 text-sm text-gray-500 items-center">
                            <span className="flex items-center gap-1.5"><User size={16}/> {report.reporter?.name || report.reporter?.email}</span>
                            <span className="flex items-center gap-1.5"><Clock size={16}/> {new Date(report.createdAt).toLocaleString()}</span>
                        </div>
                    </div>
                    {user?.role === 'MAINTAINER' && (
                        <div className="flex flex-col gap-2">
                            <select 
                                value={report.status}
                                onChange={(e) => handleStatusChange(e.target.value)}
                                className="input-field py-1 text-sm bg-gray-50"
                            >
                                <option value="NEW">New</option>
                                <option value="UNDER_REVIEW">Under Review</option>
                                <option value="CLASSIFIED">Classified</option>
                                <option value="REJECTED">Rejected</option>
                                <option value="RESOLVED">Resolved</option>
                            </select>
                            <button 
                                onClick={() => setIsCreatingIssue(!isCreatingIssue)}
                                className="btn-primary py-1.5 text-sm flex items-center justify-center gap-1.5"
                            >
                                <Play size={14} /> Spawn Issue
                            </button>
                        </div>
                    )}
                </div>
                
                <div className="prose max-w-none mb-4 p-4 bg-gray-50 rounded-lg border border-gray-100">
                    <p className="whitespace-pre-wrap text-gray-800">{report.description || 'No description provided.'}</p>
                </div>
            </div>

            {/* Spawn Issue Form */}
            {isCreatingIssue && user?.role === 'MAINTAINER' && (
                <div className="bg-blue-50 p-6 rounded-xl border border-blue-200 shadow-sm animate-in slide-in-from-top-4">
                    <h3 className="text-lg font-bold text-blue-900 mb-4 flex items-center gap-2">
                        Create Linked Issue
                    </h3>
                    <form onSubmit={handleCreateIssue} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-blue-900 mb-1">Title</label>
                            <input
                                type="text"
                                required
                                value={issueData.title}
                                onChange={(e) => setIssueData({...issueData, title: e.target.value})}
                                className="input-field bg-white"
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-blue-900 mb-1">Type</label>
                                <select
                                    value={issueData.type}
                                    onChange={(e) => setIssueData({...issueData, type: e.target.value})}
                                    className="input-field bg-white"
                                >
                                    <option value="TASK">Task</option>
                                    <option value="BUG">Bug</option>
                                    <option value="FEATURE">Feature</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-blue-900 mb-1">Priority</label>
                                <select
                                    value={issueData.priority}
                                    onChange={(e) => setIssueData({...issueData, priority: e.target.value})}
                                    className="input-field bg-white"
                                >
                                    <option value="LOW">Low</option>
                                    <option value="MEDIUM">Medium</option>
                                    <option value="HIGH">High</option>
                                    <option value="CRITICAL">Critical</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-blue-900 mb-1">Severity</label>
                                <select
                                    value={issueData.severity}
                                    onChange={(e) => setIssueData({...issueData, severity: e.target.value})}
                                    className="input-field bg-white"
                                >
                                    <option value="TRIVIAL">Trivial</option>
                                    <option value="MINOR">Minor</option>
                                    <option value="MAJOR">Major</option>
                                    <option value="CRITICAL">Critical</option>
                                    <option value="BLOCKER">Blocker</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-blue-900 mb-1">Project</label>
                                <select
                                    value={issueData.projectId}
                                    onChange={(e) => setIssueData({...issueData, projectId: e.target.value})}
                                    className="input-field bg-white"
                                    required
                                >
                                    {projects.map(p => (
                                        <option key={p.id} value={p.id}>{p.name}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                        <div className="flex justify-end gap-2 pt-2">
                            <button type="button" onClick={() => setIsCreatingIssue(false)} className="btn-secondary text-sm">Cancel</button>
                            <button type="submit" className="btn-primary text-sm bg-blue-600 hover:bg-blue-700">Create Issue</button>
                        </div>
                    </form>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-2 space-y-6">
                    {/* Comments Section */}
                    <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                        <h3 className="text-lg font-bold flex items-center gap-2 mb-6 text-gray-900">
                            <MessageSquare size={20} className="text-primary" /> Comments ({comments.length})
                        </h3>
                        
                        <div className="space-y-4 mb-6">
                            {comments.map(comment => (
                                <div key={comment.id} className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                                    <div className="flex justify-between text-xs text-gray-500 mb-2">
                                        <span className="font-semibold text-gray-900">{comment.user?.name || comment.user?.email}</span>
                                        <span>{new Date(comment.createdAt).toLocaleString()}</span>
                                    </div>
                                    <p className="text-sm text-gray-800 whitespace-pre-wrap">{comment.content}</p>
                                </div>
                            ))}
                            {comments.length === 0 && <p className="text-gray-500 text-sm text-center py-4">No comments yet.</p>}
                        </div>

                        <form onSubmit={handleAddComment}>
                            <textarea
                                value={newComment}
                                onChange={(e) => setNewComment(e.target.value)}
                                className="input-field mb-3"
                                rows="3"
                                placeholder="Add a comment..."
                                required
                            />
                            <div className="flex justify-end">
                                <button type="submit" className="btn-primary text-sm px-6">Post Comment</button>
                            </div>
                        </form>
                    </div>
                </div>

                <div className="md:col-span-1">
                    {/* Activity Log */}
                    <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                        <h3 className="text-base font-bold mb-4 text-gray-900">Activity History</h3>
                        <div className="space-y-4 relative before:absolute before:inset-0 before:ml-2.5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-300 before:to-transparent">
                            {activities.map(activity => (
                                <div key={activity.id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                                    <div className="flex items-center justify-center w-5 h-5 rounded-full border border-white bg-slate-300 group-[.is-active]:bg-primary text-slate-500 group-[.is-active]:text-emerald-50 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2"></div>
                                    <div className="w-[calc(100%-2.5rem)] md:w-[calc(50%-1.5rem)] p-3 rounded-lg border border-slate-200 bg-white shadow-sm">
                                        <div className="flex items-center justify-between mb-1">
                                            <div className="font-semibold text-xs text-slate-900">{activity.user?.name || activity.user?.email}</div>
                                            <div className="text-[10px] text-slate-500">{new Date(activity.createdAt).toLocaleDateString()}</div>
                                        </div>
                                        <div className="text-xs text-slate-600">
                                            {activity.action === 'STATUS_CHANGE' && (
                                                <span>Changed status from <span className="font-medium text-slate-900">{activity.oldValue || 'None'}</span> to <span className="font-medium text-primary">{activity.newValue}</span></span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
