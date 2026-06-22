import React from 'react';
import { Draggable } from '@hello-pangea/dnd';
import { Timer } from 'lucide-react';

export const KanbanCard = ({ issue, index, onClick }) => {
    const getPriorityColor = (priority) => {
        switch (priority) {
            case 'CRITICAL': return 'bg-red-100 text-red-800 border border-red-200';
            case 'HIGH': return 'bg-orange-100 text-orange-800 border border-orange-200';
            case 'MEDIUM': return 'bg-yellow-100 text-yellow-800 border border-yellow-200';
            case 'LOW': return 'bg-emerald-100 text-emerald-800 border border-emerald-200';
            default: return 'bg-gray-100 text-gray-800 border border-gray-200';
        }
    };

    const isOverdue = issue.dueDate && new Date() > new Date(issue.dueDate);
    const isWarning = issue.dueDate && new Date(new Date().getTime() + 30*60000) > new Date(issue.dueDate) && new Date() <= new Date(issue.dueDate);
    const isResolved = ['RESOLVED', 'CLOSED'].includes(issue.status);

    return (
        <Draggable draggableId={String(issue.id)} index={index}>
            {(provided, snapshot) => (
                <div
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                    onClick={onClick}
                    className={`bg-white border border-gray-200 rounded-lg p-4 mb-3 cursor-pointer group hover:border-primary hover:shadow-md transition-all duration-200 ${
                        snapshot.isDragging ? 'shadow-xl shadow-primary/10 rotate-2 scale-105 z-50 ring-2 ring-primary' : 'shadow-sm'
                    }`}
                    style={provided.draggableProps.style}
                >
                    <div className="flex justify-between items-start mb-3">
                        <span className="text-xs font-bold text-gray-500 group-hover:text-primary transition-colors">#{issue.id}</span>
                        <span className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full ${getPriorityColor(issue.priority)}`}>
                            {issue.priority}
                        </span>
                    </div>
                    
                    <h4 className="text-sm font-semibold text-gray-900 mb-3 leading-snug group-hover:text-primary-hover transition-colors line-clamp-2">
                        {issue.title}
                    </h4>
                    
                    {issue.labels && issue.labels.length > 0 && (
                        <div className="flex flex-wrap gap-1 mb-3">
                            {issue.labels.map(l => (
                                <span key={l} className="text-[10px] bg-gray-50 text-gray-600 px-1.5 py-0.5 rounded border border-gray-200">
                                    {l}
                                </span>
                            ))}
                        </div>
                    )}

                    {/* SLA Badge */}
                    {issue.dueDate && (
                        <div className={`flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded w-fit mb-3 ${
                            isResolved ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                            isOverdue ? 'bg-red-50 text-red-700 border border-red-200 animate-pulse' :
                            isWarning ? 'bg-orange-50 text-orange-700 border border-orange-200' :
                            'bg-gray-100 text-gray-600 border border-gray-200'
                        }`}>
                            <Timer size={12} />
                            {isResolved ? 'MET SLA' :
                             isOverdue ? 'OVERDUE' :
                             isWarning ? 'WARNING' :
                             new Date(issue.dueDate).toLocaleDateString()}
                        </div>
                    )}
                    
                    <div className="flex justify-between items-center mt-auto pt-3 border-t border-gray-100">
                        <span className="text-xs text-gray-500 font-medium">{issue.type}</span>
                        {issue.assignee ? (
                            <div 
                                className="h-6 w-6 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs ring-2 ring-white"
                                title={`Assigned to ${issue.assignee.name}`}
                            >
                                {issue.assignee.name.charAt(0)}
                            </div>
                        ) : (
                            <div className="h-6 w-6 rounded-full bg-gray-100 text-gray-400 flex items-center justify-center text-xs ring-2 ring-white" title="Unassigned">
                                ?
                            </div>
                        )}
                    </div>
                </div>
            )}
        </Draggable>
    );
};
