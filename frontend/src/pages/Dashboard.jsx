import React, { useState, useEffect } from 'react';
import { getIssues } from '../services/issue.service';
import { useAuth } from '../context/AuthContext';
import { Search, Filter, AlertCircle, Clock, CheckCircle2, MoreHorizontal } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const Dashboard = () => {
    const [issues, setIssues] = useState([]);
    const [loading, setLoading] = useState(true);
    const { user } = useAuth();
    const navigate = useNavigate();

    const fetchIssues = async () => {
        try {
            setLoading(true);
            const data = await getIssues();
            setIssues(data);
        } catch (error) {
            console.error('Failed to fetch issues', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (user?.role === 'REPORTER') {
            navigate('/reports');
        } else {
            fetchIssues();
        }
    }, [user, navigate]);

    const getStatusIcon = (status) => {
        switch (status) {
            case 'OPEN': return <AlertCircle className="h-5 w-5 text-blue-500" />;
            case 'IN_PROGRESS': return <Clock className="h-5 w-5 text-purple-500" />;
            case 'REVIEW': return <Search className="h-5 w-5 text-amber-500" />;
            case 'DONE': return <CheckCircle2 className="h-5 w-5 text-emerald-500" />;
            default: return <MoreHorizontal className="h-5 w-5 text-gray-500" />;
        }
    };

    const getPriorityColor = (priority) => {
        switch (priority) {
            case 'CRITICAL': return 'bg-red-100 text-red-800';
            case 'HIGH': return 'bg-orange-100 text-orange-800';
            case 'MEDIUM': return 'bg-yellow-100 text-yellow-800';
            case 'LOW': return 'bg-green-100 text-green-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
                    <p className="text-gray-500 mt-1">Welcome back, {user?.email.split('@')[0]}</p>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="p-4 border-b border-gray-200 bg-gray-50 flex items-center justify-between">
                    <h2 className="font-semibold text-gray-700">Recent Issues</h2>
                    <button className="text-gray-500 hover:text-gray-700">
                        <Filter className="h-5 w-5" />
                    </button>
                </div>
                
                {loading ? (
                    <div className="p-8 text-center text-gray-500">Loading issues...</div>
                ) : issues.length === 0 ? (
                    <div className="p-8 text-center text-gray-500">No issues found.</div>
                ) : (
                    <ul className="divide-y divide-gray-200">
                        {issues.map((issue) => (
                            <li 
                                key={issue.id} 
                                className="p-4 hover:bg-gray-50 transition-colors cursor-pointer flex items-center justify-between"
                                onClick={() => navigate(`/board?issue=${issue.id}`)}
                            >
                                <div className="flex items-center gap-4">
                                    {getStatusIcon(issue.status)}
                                    <div>
                                        <div className="font-medium text-gray-900 flex items-center gap-2">
                                            {issue.title}
                                            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${getPriorityColor(issue.priority)}`}>
                                                {issue.priority}
                                            </span>
                                        </div>
                                        <div className="text-sm text-gray-500 mt-1 flex items-center gap-2">
                                            <span>#{issue.id}</span>
                                            <span>•</span>
                                            <span>opened by {issue.creator?.name || issue.creator?.email}</span>
                                        </div>
                                    </div>
                                </div>
                                
                                <div className="flex items-center gap-4">
                                    {issue.assignee && (
                                        <div className="flex items-center gap-2 text-sm text-gray-600">
                                            <div className="h-6 w-6 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs">
                                                {issue.assignee.name.charAt(0)}
                                            </div>
                                            <span className="hidden sm:inline">{issue.assignee.name}</span>
                                        </div>
                                    )}
                                </div>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
};
