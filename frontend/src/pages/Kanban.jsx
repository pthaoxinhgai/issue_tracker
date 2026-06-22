import React, { useState } from 'react';
import { KanbanBoard } from '../components/board/KanbanBoard';
import { Filter, X } from 'lucide-react';

export const Kanban = () => {
    const [showFilters, setShowFilters] = useState(false);
    const [activeFilters, setActiveFilters] = useState({
        priority: 'ALL',
        type: 'ALL',
        onlyMyIssues: false
    });

    const handleFilterChange = (key, value) => {
        setActiveFilters(prev => ({ ...prev, [key]: value }));
    };

    const clearFilters = () => {
        setActiveFilters({
            priority: 'ALL',
            type: 'ALL',
            onlyMyIssues: false
        });
    };

    const hasActiveFilters = activeFilters.priority !== 'ALL' || activeFilters.type !== 'ALL' || activeFilters.onlyMyIssues;

    return (
        <div className="h-[calc(100vh-4rem)] flex flex-col pt-6 pb-2 px-4 sm:px-6 lg:px-8 mx-auto w-full text-gray-900 bg-gray-50 min-h-screen">
            <div className="flex justify-between items-end mb-4 shrink-0">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Kanban Board</h1>
                    <p className="text-sm text-gray-500 mt-1">Drag and drop issues across the State Machine.</p>
                </div>
                <div className="flex items-center gap-3">
                    <button 
                        onClick={() => setShowFilters(!showFilters)}
                        className={`btn-secondary flex items-center gap-2 ${showFilters || hasActiveFilters ? 'border-primary text-primary bg-primary/5' : ''}`}
                    >
                        <Filter className="h-4 w-4" />
                        Filter {hasActiveFilters && <span className="flex h-2 w-2 rounded-full bg-primary ml-1"></span>}
                    </button>
                    {/* Settings button removed for cleaner UI as it had no function */}
                </div>
            </div>

            {/* Filter Menu */}
            {showFilters && (
                <div className="bg-white border border-gray-200 rounded-lg p-4 mb-4 shadow-sm flex flex-wrap gap-6 items-center shrink-0 animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="flex items-center gap-2">
                        <label className="text-sm font-semibold text-gray-700">Priority:</label>
                        <select 
                            className="input-field py-1 px-2 text-sm w-auto"
                            value={activeFilters.priority}
                            onChange={(e) => handleFilterChange('priority', e.target.value)}
                        >
                            <option value="ALL">All Priorities</option>
                            <option value="CRITICAL">Critical</option>
                            <option value="HIGH">High</option>
                            <option value="MEDIUM">Medium</option>
                            <option value="LOW">Low</option>
                        </select>
                    </div>

                    <div className="flex items-center gap-2">
                        <label className="text-sm font-semibold text-gray-700">Type:</label>
                        <select 
                            className="input-field py-1 px-2 text-sm w-auto"
                            value={activeFilters.type}
                            onChange={(e) => handleFilterChange('type', e.target.value)}
                        >
                            <option value="ALL">All Types</option>
                            <option value="BUG">Bug</option>
                            <option value="FEATURE_REQUEST">Feature Request</option>
                            <option value="TASK">Task</option>
                            <option value="QUESTION">Question</option>
                            <option value="INCIDENT">Incident</option>
                        </select>
                    </div>

                    <div className="flex items-center gap-2">
                        <label className="flex items-center cursor-pointer">
                            <div className="relative">
                                <input 
                                    type="checkbox" 
                                    className="sr-only" 
                                    checked={activeFilters.onlyMyIssues}
                                    onChange={(e) => handleFilterChange('onlyMyIssues', e.target.checked)}
                                />
                                <div className={`block w-10 h-6 rounded-full transition-colors ${activeFilters.onlyMyIssues ? 'bg-primary' : 'bg-gray-300'}`}></div>
                                <div className={`dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${activeFilters.onlyMyIssues ? 'transform translate-x-4' : ''}`}></div>
                            </div>
                            <span className="ml-3 text-sm font-semibold text-gray-700">Only My Issues</span>
                        </label>
                    </div>

                    {hasActiveFilters && (
                        <button 
                            onClick={clearFilters}
                            className="ml-auto text-sm text-gray-500 hover:text-red-500 flex items-center gap-1 transition-colors"
                        >
                            <X className="h-4 w-4" /> Clear Filters
                        </button>
                    )}
                </div>
            )}
            
            <div className="flex-1 min-h-0">
                <KanbanBoard activeFilters={activeFilters} />
            </div>
        </div>
    );
};
