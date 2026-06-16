import React from 'react';
import { Draggable } from '@hello-pangea/dnd';

export const KanbanCard = ({ issue, index, onClick }) => {
    const getPriorityColor = (priority) => {
        switch (priority) {
            case 'CRITICAL': return 'bg-red-100 text-red-800 border border-red-200';
            case 'HIGH': return 'bg-orange-100 text-orange-800 border border-orange-200';
            case 'MEDIUM': return 'bg-yellow-100 text-yellow-800 border border-yellow-200';
            case 'LOW': return 'bg-green-100 text-green-800 border border-green-200';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    return (
        <Draggable draggableId={String(issue.id)} index={index}>
            {(provided, snapshot) => (
                <div
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                    onClick={onClick}
                    className={`card p-4 mb-3 cursor-pointer group hover:shadow-md transition-all duration-200 ${
                        snapshot.isDragging ? 'shadow-lg rotate-2 scale-105 z-50' : ''
                    }`}
                    style={provided.draggableProps.style}
                >
                    <div className="flex justify-between items-start mb-2">
                        <span className="text-xs font-semibold text-gray-500">#{issue.id}</span>
                        <span className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full ${getPriorityColor(issue.priority)}`}>
                            {issue.priority}
                        </span>
                    </div>
                    
                    <h4 className="text-sm font-medium text-gray-900 mb-3 leading-snug group-hover:text-primary transition-colors">
                        {issue.title}
                    </h4>
                    
                    {issue.labels && issue.labels.length > 0 && (
                        <div className="flex flex-wrap gap-1 mb-3">
                            {issue.labels.map(l => (
                                <span key={l} className="text-[10px] bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded border border-gray-200">
                                    {l}
                                </span>
                            ))}
                        </div>
                    )}
                    
                    <div className="flex justify-between items-center mt-auto pt-2 border-t border-gray-100">
                        <span className="text-xs text-gray-400 font-medium">{issue.type}</span>
                        {issue.assignee && (
                            <div 
                                className="h-6 w-6 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs ring-2 ring-white"
                                title={`Assigned to ${issue.assignee.name}`}
                            >
                                {issue.assignee.name.charAt(0)}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </Draggable>
    );
};
