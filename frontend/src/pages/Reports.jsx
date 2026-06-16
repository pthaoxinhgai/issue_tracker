import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { reportService } from '../services/report.service';
import { useAuth } from '../context/AuthContext';
import { Loader2, PlusSquare, FileText } from 'lucide-react';

export const Reports = () => {
    const { user } = useAuth();
    const [reports, setReports] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadReports();
    }, [user]);

    const loadReports = async () => {
        try {
            setLoading(true);
            let data = [];
            if (user?.role === 'MAINTAINER') {
                data = await reportService.getAllReports();
            } else if (user?.role === 'REPORTER') {
                data = await reportService.getMyReports();
            }
            setReports(data);
        } catch (error) {
            console.error('Failed to load reports', error);
        } finally {
            setLoading(false);
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

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Problem Reports</h1>
                    <p className="text-gray-500 mt-1">
                        {user?.role === 'MAINTAINER' ? 'Manage all submitted reports' : 'Track your submitted reports'}
                    </p>
                </div>
                {user?.role === 'REPORTER' && (
                    <Link to="/reports/new" className="btn-primary flex items-center gap-2">
                        <PlusSquare className="h-4 w-4" />
                        Submit Report
                    </Link>
                )}
            </div>

            {loading ? (
                <div className="flex justify-center items-center h-64">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
            ) : reports.length === 0 ? (
                <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
                    <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                        <FileText className="h-8 w-8 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No reports found</h3>
                    <p className="text-gray-500">
                        {user?.role === 'REPORTER' ? 'You haven\'t submitted any problem reports yet.' : 'There are no problem reports in the system.'}
                    </p>
                </div>
            ) : (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reporter</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {reports.map((report) => (
                                <tr key={report.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                        #{report.id}
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-900">
                                        <div className="font-medium">{report.title}</div>
                                        <div className="text-gray-500 text-xs truncate max-w-xs">{report.description}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(report.status)}`}>
                                            {report.status.replace('_', ' ')}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {report.reporter?.name || report.reporter?.email}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {new Date(report.createdAt).toLocaleDateString()}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <Link to={`/reports/${report.id}`} className="text-primary hover:text-primary-focus">
                                            View Details
                                        </Link>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};
