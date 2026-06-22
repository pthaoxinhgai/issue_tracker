import React from 'react';
import { Droppable } from '@hello-pangea/dnd';
import { KanbanCard } from './KanbanCard';

export const KanbanColumn = ({ status, issues, onIssueClick }) => {
    
    const getColumnTitle = (s) => {
        return s.replace(/_/g, ' ');
    };

    const getColumnColor = (s) => {
        switch(s) {
            case 'NEW': return 'border-t-blue-500 text-blue-600 bg-blue-50/50';
            case 'TRIAGED': return 'border-t-indigo-500 text-indigo-600 bg-indigo-50/50';
            case 'ESCALATED': return 'border-t-red-500 text-red-600 bg-red-50/50';
            case 'ASSIGNED': return 'border-t-cyan-500 text-cyan-600 bg-cyan-50/50';
            case 'IN_PROGRESS': return 'border-t-purple-500 text-purple-600 bg-purple-50/50';
            case 'READY_FOR_QA': return 'border-t-amber-500 text-amber-600 bg-amber-50/50';
            case 'RESOLVED': return 'border-t-emerald-500 text-emerald-600 bg-emerald-50/50';
            case 'CLOSED': return 'border-t-slate-500 text-slate-600 bg-slate-50/50';
            default: return 'border-t-slate-500 text-slate-600 bg-slate-50/50';
        }
    };

    const colorClasses = getColumnColor(status);
    const borderColor = colorClasses.split(' ')[0];
    const textColor = colorClasses.split(' ')[1];
    const headerBg = colorClasses.split(' ')[2];

    return (
        <div className="flex flex-col flex-shrink-0 w-80 bg-gray-50 rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className={`p-4 border-t-4 flex items-center justify-between ${borderColor} ${headerBg} border-b border-gray-200`}>
                <h3 className={`font-black tracking-widest text-xs uppercase ${textColor}`}>{getColumnTitle(status)}</h3>
                <span className="bg-white text-gray-700 text-xs font-bold px-2.5 py-0.5 rounded-full border border-gray-200 shadow-sm">
                    {issues.length}
                </span>
            </div>

            <Droppable droppableId={status}>
                {(provided, snapshot) => (
                    <div 
                        ref={provided.innerRef} 
                        {...provided.droppableProps}
                        className={`flex-1 p-3 overflow-y-auto min-h-[150px] transition-colors ${
                            snapshot.isDraggingOver ? 'bg-primary/5 border border-primary/20 rounded-b-xl' : 'bg-transparent'
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
