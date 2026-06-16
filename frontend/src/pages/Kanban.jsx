import React from 'react';
import { KanbanBoard } from '../components/board/KanbanBoard';
import { Settings, Filter } from 'lucide-react';

export const Kanban = () => {
    return (
        <div className="h-[calc(100vh-4rem)] flex flex-col pt-6 pb-2 px-4 sm:px-6 lg:px-8 max-w-[1600px] mx-auto w-full">
            <div className="flex justify-between items-end mb-6 shrink-0">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Kanban Board</h1>
                    <p className="text-sm text-gray-500 mt-1">Drag and drop issues to update their status.</p>
                </div>
                <div className="flex items-center gap-3">
                    <button className="btn-secondary flex items-center gap-2">
                        <Filter className="h-4 w-4" />
                        Filter
                    </button>
                    <button className="btn-secondary flex items-center gap-2">
                        <Settings className="h-4 w-4" />
                        Settings
                    </button>
                </div>
            </div>
            
            <div className="flex-1 min-h-0">
                <KanbanBoard />
            </div>
        </div>
    );
};
