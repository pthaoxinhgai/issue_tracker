import React from 'react';
import { Droppable } from '@hello-pangea/dnd';
import { KanbanCard } from './KanbanCard';

export const KanbanColumn = ({ status, issues, onIssueClick }) => {
    
    const getColumnTitle = (s) => {
        return s.replace('_', ' ');
    };

    const getColumnColor = (s) => {
        switch(s) {
            case 'OPEN': return 'border-t-blue-500';
            case 'IN_PROGRESS': return 'border-t-purple-500';
            case 'REVIEW': return 'border-t-amber-500';
            case 'DONE': return 'border-t-emerald-500';
            default: return 'border-t-gray-500';
        }
    };

    return (
        <div className="flex flex-col flex-shrink-0 w-80 bg-gray-50/80 rounded-xl border border-gray-200">
            <div className={`p-4 border-t-4 rounded-t-xl flex items-center justify-between ${getColumnColor(status)} bg-white border-b border-gray-200`}>
                <h3 className="font-semibold text-gray-800 tracking-wide text-sm">{getColumnTitle(status)}</h3>
                <span className="bg-gray-100 text-gray-600 text-xs font-bold px-2 py-1 rounded-full">
                    {issues.length}
                </span>
            </div>

            <Droppable droppableId={status}>
                {(provided, snapshot) => (
                    <div 
                        ref={provided.innerRef} 
                        {...provided.droppableProps}
                        className={`flex-1 p-3 overflow-y-auto min-h-[150px] transition-colors ${
                            snapshot.isDraggingOver ? 'bg-primary/5' : ''
                        }`}
                    >
                        {issues.map((issue, index) => (
                            <KanbanCard 
                                key={issue.id} 
                                issue={issue} 
                                index={index} 
                                onClick={() => onIssueClick(issue.id)}
                            />
                        ))}
                        {provided.placeholder}
                    </div>
                )}
            </Droppable>
        </div>
    );
};
