import React, { useEffect, useState } from 'react';
import { issueService } from '../api/issueService';
import { Link } from 'react-router-dom';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';

const KanbanBoard = () => {
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchIssues();
  }, []);

  const fetchIssues = async () => {
    try {
      const data = await issueService.getAll();
      setIssues(data);
    } catch (error) {
      console.error('Failed to fetch issues', error);
    } finally {
      setLoading(false);
    }
  };

  const moveIssue = async (id, newStatus) => {
    try {
      await issueService.update(id, { status: newStatus });
      fetchIssues(); // Refresh board
    } catch (error) {
      console.error('Failed to update status', error);
      alert(error.response?.data?.message || 'Failed to update status');
    }
  };

  const onDragEnd = async (result) => {
    const { destination, source, draggableId } = result;

    if (!destination) return;

    const sourceStatus = source.droppableId;
    const destStatus = destination.droppableId;

    if (
      destStatus === sourceStatus &&
      destination.index === source.index
    ) {
      return;
    }

    // Dynamic restriction based on column config
    const sourceCol = columns.find(c => c.status === sourceStatus);
    const isValidTransition = (destStatus === sourceCol.next || destStatus === sourceCol.prev);

    if (!isValidTransition) {
      return;
    }

    const newStatus = destStatus;
    
    // Optimistic update
    const updatedIssues = issues.map(issue => 
      issue.id.toString() === draggableId ? { ...issue, status: newStatus } : issue
    );
    setIssues(updatedIssues);

    try {
      await issueService.update(draggableId, { status: newStatus });
    } catch (error) {
      console.error('Failed to update status', error);
      fetchIssues(); // Revert on failure
    }
  };

  const columns = [
    { title: 'To Do', status: 'ASSIGNED', next: 'IN_PROGRESS', prev: null, bg: 'bg-[#1c2128]', border: 'border-slate-500/30' },
    { title: 'In Progress', status: 'IN_PROGRESS', next: 'READY_FOR_QA', prev: 'ASSIGNED', bg: 'bg-[#1c2128]', border: 'border-blue-500/30' },
    { title: 'Ready for QA', status: 'READY_FOR_QA', next: 'RESOLVED', prev: 'IN_PROGRESS', bg: 'bg-[#1c2128]', border: 'border-purple-500/30' },
    { title: 'Resolved', status: 'RESOLVED', next: 'CLOSED', prev: 'READY_FOR_QA', bg: 'bg-[#1c2128]', border: 'border-yellow-500/30' },
    { title: 'Closed', status: 'CLOSED', next: null, prev: 'RESOLVED', bg: 'bg-[#1c2128]', border: 'border-green-500/30', isDone: true }
  ];

  if (loading) return <div className="text-center p-12 text-slate-500 text-sm">Loading Kanban Board...</div>;

  return (
    <div className="h-full flex flex-col space-y-8">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold">Kanban Board</h2>
        <div className="text-sm text-slate-500 uppercase tracking-widest font-semibold">
          Sprint 1
        </div>
      </div>
      
      <DragDropContext onDragEnd={onDragEnd}>
        <div className="flex-1">
          <div className="flex gap-5 h-full">
            {columns.map(col => {
              const colIssues = issues.filter(i => i.status === col.status);
              return (
                <div key={col.status} className={`flex-1 min-w-[250px] ${col.bg} rounded-lg flex flex-col border border-border shadow-md`}>
                  <div className={`px-4 py-3 flex justify-between items-center border-b border-border bg-[#22272e] rounded-t-lg`}>
                    <span className="text-sm font-bold uppercase tracking-wider text-slate-400">{col.title}</span>
                    <span className="bg-[#313d4a] text-xs px-2 py-0.5 rounded text-slate-300 font-mono font-bold">{colIssues.length}</span>
                  </div>
                  
                  <Droppable droppableId={col.status}>
                    {(provided, snapshot) => (
                      <div 
                        {...provided.droppableProps}
                        ref={provided.innerRef}
                        className={`flex-1 p-3 overflow-y-auto space-y-3 transition-colors ${snapshot.isDraggingOver ? 'bg-[#313d4a]/20' : ''}`}
                      >
                        {colIssues.map((issue, index) => (
                          <Draggable key={issue.id} draggableId={issue.id.toString()} index={index}>
                            {(provided, snapshot) => (
                              <div 
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                                className={`bg-[#22272e] p-5 rounded-lg border border-border hover:border-[#444c56] transition-all shadow-md group ${snapshot.isDragging ? 'shadow-2xl ring-2 ring-primary/40 z-50' : ''}`}
                              >
                                <div className="text-xs font-mono text-slate-500 mb-2 font-bold">ISS-{issue.id}</div>
                                <Link to={`/issue/${issue.id}`} className="text-lg font-semibold text-[#adbac7] hover:text-primary transition-colors block leading-snug">
                                  {issue.title}
                                </Link>
                                
                                <div className="flex justify-between items-center mt-5">
                                  <div className="flex items-center gap-3">
                                    <div className="w-7 h-7 rounded-full bg-slate-700 flex items-center justify-center text-xs font-bold text-white shadow-inner">
                                      {issue.assignee?.name?.charAt(0) || '?'}
                                    </div>
                                    <div className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${
                                      issue.priority === 'HIGH' ? 'border-red-500/50 text-red-500 bg-red-500/10' :
                                      issue.priority === 'MEDIUM' ? 'border-orange-500/50 text-orange-500 bg-orange-500/10' :
                                      'border-green-500/50 text-green-500 bg-green-500/10'
                                    }`}>
                                      {issue.priority}
                                    </div>
                                  </div>
                                  
                                  <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    {col.prev && (
                                       <button 
                                         onClick={() => moveIssue(issue.id, col.prev)} 
                                         className={`flex items-center justify-center transition-all ${
                                           col.isDone 
                                           ? 'text-xs px-3 py-1.5 rounded font-bold bg-yellow-600 text-white hover:bg-yellow-500' 
                                           : 'text-lg w-9 h-9 rounded-full bg-slate-700 hover:bg-slate-600 text-white shadow-sm'
                                         }`}
                                       >
                                         {col.isDone ? 'ReOpen' : '←'}
                                       </button>
                                    )}
                                    {col.next && (
                                      <button 
                                        onClick={() => moveIssue(issue.id, col.next)} 
                                        className="flex items-center justify-center text-lg w-9 h-9 rounded-full bg-primary text-[#1d2125] font-bold hover:bg-primaryHover transition-all shadow-sm"
                                      >
                                        →
                                      </button>
                                    )}
                                  </div>
                                </div>
                              </div>
                            )}
                          </Draggable>
                        ))}
                        {provided.placeholder}
                        {colIssues.length === 0 && !snapshot.isDraggingOver && (
                           <div className="text-center text-slate-600 text-xs py-6 border border-dashed border-border rounded-lg">
                              No issues
                           </div>
                        )}
                      </div>
                    )}
                  </Droppable>
                </div>
              );
            })}
          </div>
        </div>
      </DragDropContext>
    </div>
  );
};

export default KanbanBoard;
