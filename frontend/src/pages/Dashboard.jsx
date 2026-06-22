import React, { useState, useEffect } from 'react';
import { getDashboardStats } from '../services/issue.service';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { AlertTriangle, ShieldCheck, CheckCircle2, Clock, Users, Flame, PieChart, Timer } from 'lucide-react';

export const Dashboard = () => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const { user } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (user?.role === 'REPORTER') {
            navigate('/reports');
        } else {
            fetchStats();
        }
    }, [user, navigate]);

    const fetchStats = async () => {
        try {
            setLoading(true);
            const data = await getDashboardStats();
            setStats(data);
        } catch (error) {
            console.error('Failed to fetch dashboard stats', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading || !stats) {
        return <div className="flex h-screen items-center justify-center bg-gray-50 text-primary">Loading Analytics...</div>;
    }

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-gray-900 bg-gray-50 min-h-screen">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                    <PieChart className="text-primary" size={32} /> Analytics Command Center
                </h1>
                <p className="text-gray-500 mt-2">Real-time operational metrics for {user?.email.split('@')[0]}</p>
            </div>

            {/* Key Metrics Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm flex items-center justify-between">
                    <div>
                        <p className="text-gray-500 text-sm font-medium uppercase tracking-wider">Total Active Issues</p>
                        <p className="text-4xl font-black text-gray-900 mt-2">{stats.openIssues}</p>
                    </div>
                    <div className="bg-primary/10 p-4 rounded-full text-primary">
                        <Flame size={32} />
                    </div>
                </div>

                <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm flex items-center justify-between">
                    <div>
                        <p className="text-gray-500 text-sm font-medium uppercase tracking-wider">Unassigned</p>
                        <p className="text-4xl font-black text-amber-600 mt-2">{stats.unassignedIssues}</p>
                    </div>
                    <div className="bg-amber-100 p-4 rounded-full text-amber-600">
                        <Users size={32} />
                    </div>
                </div>

                <div className="bg-white border border-red-200 rounded-xl p-6 shadow-sm flex items-center justify-between relative overflow-hidden">
                    <div className="absolute inset-0 bg-red-50 animate-pulse"></div>
                    <div className="relative z-10">
                        <p className="text-red-600 text-sm font-medium uppercase tracking-wider">SLA Breaches</p>
                        <p className="text-4xl font-black text-red-600 mt-2">{stats.slaBreachedIssues}</p>
                    </div>
                    <div className="bg-red-100 p-4 rounded-full text-red-600 relative z-10">
                        <AlertTriangle size={32} />
                    </div>
                </div>

                <div className="bg-white border border-emerald-200 rounded-xl p-6 shadow-sm flex items-center justify-between">
                    <div>
                        <p className="text-emerald-600 text-sm font-medium uppercase tracking-wider">Resolved / Closed</p>
                        <p className="text-4xl font-black text-emerald-600 mt-2">{stats.closedIssues}</p>
                    </div>
                    <div className="bg-emerald-100 p-4 rounded-full text-emerald-600">
                        <CheckCircle2 size={32} />
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Status Distribution */}
                <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
                    <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2 mb-6 border-b border-gray-200 pb-4">
                        <ShieldCheck className="text-primary" size={24} /> Distribution by Status
                    </h2>
                    <div className="space-y-4">
                        {Object.entries(stats.issuesByStatus).map(([status, count]) => {
                            const percentage = Math.round((count / stats.totalIssues) * 100) || 0;
                            return (
                                <div key={status}>
                                    <div className="flex justify-between text-sm mb-1">
                                        <span className="font-semibold text-gray-700">{status}</span>
                                        <span className="text-gray-500">{count} ({percentage}%)</span>
                                    </div>
                                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                                        <div className="bg-primary h-2.5 rounded-full" style={{ width: `${percentage}%` }}></div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Priority & SLA Warnings */}
                <div className="space-y-8">
                    {/* Priority Distribution */}
                    <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
                        <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2 mb-6 border-b border-gray-200 pb-4">
                            <AlertTriangle className="text-orange-500" size={24} /> Active Issues by Priority
                        </h2>
                        <div className="grid grid-cols-2 gap-4">
                            {['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'].map(priority => (
                                <div key={priority} className="bg-gray-50 p-4 rounded-lg border border-gray-200 flex justify-between items-center">
                                    <span className="text-sm font-bold text-gray-700">{priority}</span>
                                    <span className={`text-xl font-black ${
                                        priority === 'CRITICAL' ? 'text-red-600' :
                                        priority === 'HIGH' ? 'text-orange-600' :
                                        priority === 'MEDIUM' ? 'text-yellow-600' : 'text-emerald-600'
                                    }`}>
                                        {stats.issuesByPriority[priority] || 0}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Proactive SLA Warnings */}
                    <div className="bg-orange-50 border border-orange-200 rounded-xl p-6 shadow-sm">
                        <h2 className="text-xl font-bold text-orange-600 flex items-center gap-2 mb-2">
                            <Timer size={24} /> Proactive SLA Watch
                        </h2>
                        <p className="text-gray-600 text-sm mb-4">Issues that are approaching their deadline within 30 minutes.</p>
                        <div className="flex items-center gap-4">
                            <div className="text-5xl font-black text-orange-600">{stats.slaWarningIssues}</div>
                            <div className="text-orange-800/80 text-sm">
                                These tickets need immediate attention before they breach their SLA agreements!
                            </div>
                        </div>
                        <div className="mt-6">
                            <button onClick={() => navigate('/board')} className="btn-primary bg-orange-600 hover:bg-orange-700 w-full text-center py-2 text-white font-bold rounded shadow-sm">
                                View Board to Triage
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
