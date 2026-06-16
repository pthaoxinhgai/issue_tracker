import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { reportService } from '../services/report.service';
import { Loader2 } from 'lucide-react';

export const CreateReport = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        title: '',
        description: ''
    });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await reportService.createReport(formData);
            navigate('/reports');
        } catch (error) {
            console.error('Failed to create report', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-6">Submit Problem Report</h1>
            
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Title <span className="text-red-500">*</span></label>
                        <input
                            type="text"
                            required
                            value={formData.title}
                            onChange={(e) => setFormData({...formData, title: e.target.value})}
                            className="input-field"
                            placeholder="e.g. System crash on login"
                        />
                    </div>
                    
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                        <textarea
                            rows={6}
                            value={formData.description}
                            onChange={(e) => setFormData({...formData, description: e.target.value})}
                            className="input-field resize-none"
                            placeholder="Describe the problem in detail. What happened? How to reproduce it?"
                        />
                    </div>
                    
                    <div className="pt-4 flex justify-end gap-3 border-t border-gray-100">
                        <button 
                            type="button" 
                            onClick={() => navigate(-1)}
                            className="btn-secondary"
                        >
                            Cancel
                        </button>
                        <button 
                            type="submit" 
                            disabled={loading}
                            className="btn-primary flex items-center gap-2"
                        >
                            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                            Submit Report
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
