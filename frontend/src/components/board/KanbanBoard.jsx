import React, { useState, useEffect } from 'react';
import { DragDropContext } from '@hello-pangea/dnd';
import { KanbanColumn } from './KanbanColumn';
import { getIssues, changeStatus } from '../../services/issue.service';
import { useAuth } from '../../context/AuthContext';
import { IssueDetailModal } from '../issue/IssueDetailModal';
import { useSearchParams, useNavigate } from 'react-router-dom';

const COLUMNS = ['OPEN', 'IN_PROGRESS', 'REVIEW', 'DONE'];

export const KanbanBoard = () => {
    const [issues, setIssues] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedIssueId, setSelectedIssueId] = useState(null);
    const [searchParams, setSearchParams] = useSearchParams();
    const { user, hasRole } = useAuth();

    const navigate = useNavigate();

    useEffect(() => {
        if (user?.role === 'REPORTER') {
            navigate('/reports');
            return;
        }

        fetchIssues();
        const issueId = searchParams.get('issue');
        if (issueId) {
            setSelectedIssueId(Number(issueId));
        }
    }, [searchParams, user, navigate]);

    const fetchIssues = async () => {
        try {
            setLoading(true);
            const data = await getIssues();
            setIssues(data);
        } catch (error) {
            console.error('Error fetching issues', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDragEnd = async (result) => {
        if (!result.destination) return;
        const { source, destination, draggableId } = result;

        if (source.droppableId === destination.droppableId) return;

        const issueId = Number(draggableId);
        const newStatus = destination.droppableId;
        const targetIssue = issues.find(i => i.id === issueId);

        // Client side validation based on roles and state machine rules
        // Only DEVELOPER and MAINTAINER can move issues
        if (!hasRole(['DEVELOPER', 'MAINTAINER'])) return;
        
        // Developer can only move if they are assignee (or we let backend reject it)
        if (user.role === 'DEVELOPER' && targetIssue?.assignee?.email !== user.email) {
            alert('You can only move issues assigned to you.');
            return;
        }

        // Optimistic UI update
        setIssues(prev => prev.map(issue => 
            issue.id === issueId ? { ...issue, status: newStatus } : issue
        ));

        try {
            await changeStatus(issueId, newStatus);
            fetchIssues(); // refresh to get updated timestamps/activity
        } catch (error) {
            console.error('Failed to update status', error);
            // Revert
            fetchIssues();
            alert(error.response?.data?.message || 'Invalid state transition');
        }
    };

    const handleIssueClick = (id) => {
        setSearchParams({ issue: id });
    };

    const closeIssueModal = () => {
        setSearchParams({});
        setSelectedIssueId(null);
        fetchIssues(); // refresh after modal close to catch updates
    };

    if (loading && issues.length === 0) {
        return <div className="flex justify-center items-center h-64 text-gray-500">Loading board...</div>;
    }

    return (
        <div className="h-full flex flex-col">
            <DragDropContext onDragEnd={handleDragEnd}>
                <div className="flex flex-1 gap-6 overflow-x-auto pb-4 h-full">
                    {COLUMNS.map(status => (
                        <KanbanColumn 
                            key={status} 
                            status={status} 
                            issues={issues.filter(i => i.status === status)}
                            onIssueClick={handleIssueClick}
                        />
                    ))}
                </div>
            </DragDropContext>

            {selectedIssueId && (
                <IssueDetailModal 
                    issueId={selectedIssueId} 
                    onClose={closeIssueModal} 
                />
            )}
        </div>
    );
};
