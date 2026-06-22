import React, { useState, useEffect } from 'react';
import { DragDropContext } from '@hello-pangea/dnd';
import { KanbanColumn } from './KanbanColumn';
import { getIssues, changeStatus } from '../../services/issue.service';
import { useAuth } from '../../context/AuthContext';
import { IssueDetailModal } from '../issue/IssueDetailModal';
import { useSearchParams, useNavigate } from 'react-router-dom';

const COLUMNS = ['NEW', 'TRIAGED', 'ESCALATED', 'ASSIGNED', 'IN_PROGRESS', 'READY_FOR_QA', 'RESOLVED', 'CLOSED'];

export const KanbanBoard = ({ activeFilters }) => {
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

        // Rely strictly on Backend State Machine logic for transitions and roles
        // We do optimistic UI update first


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

    // Apply filters before rendering
    const filteredIssues = issues.filter(issue => {
        if (activeFilters?.priority && activeFilters.priority !== 'ALL' && issue.priority !== activeFilters.priority) {
            return false;
        }
        if (activeFilters?.type && activeFilters.type !== 'ALL' && issue.type !== activeFilters.type) {
            return false;
        }
        if (activeFilters?.onlyMyIssues && issue.assignee?.email !== user?.email) {
            return false;
        }
        return true;
    });

    return (
        <div className="h-full flex flex-col">
            <DragDropContext onDragEnd={handleDragEnd}>
                <div className="flex flex-1 gap-6 overflow-x-auto pb-4 h-full">
                    {COLUMNS.map(status => (
                        <KanbanColumn 
                            key={status} 
                            status={status} 
                            issues={filteredIssues.filter(i => i.status === status)}
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
