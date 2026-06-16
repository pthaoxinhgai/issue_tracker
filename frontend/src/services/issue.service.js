import api from './api';

export const getIssues = async (filters = {}) => {
    const params = new URLSearchParams();
    if (filters.status) params.append('status', filters.status);
    if (filters.assigneeId) params.append('assigneeId', filters.assigneeId);
    if (filters.priority) params.append('priority', filters.priority);
    
    const response = await api.get(`/issues?${params.toString()}`);
    return response.data;
};

export const getIssueById = async (id) => {
    const response = await api.get(`/issues/${id}`);
    return response.data;
};

export const createIssue = async (issueData) => {
    const response = await api.post('/issues', issueData);
    return response.data;
};

export const updateIssue = async (id, issueData) => {
    const response = await api.put(`/issues/${id}`, issueData);
    return response.data;
};

export const deleteIssue = async (id) => {
    await api.delete(`/issues/${id}`);
};

export const changeStatus = async (id, newStatus) => {
    const response = await api.patch(`/issues/${id}/status?newStatus=${newStatus}`);
    return response.data;
};

export const assignIssue = async (id, userId) => {
    const response = await api.post(`/issues/${id}/assign/${userId}`);
    return response.data;
};

export const addLabel = async (id, label) => {
    const response = await api.post(`/issues/${id}/labels?label=${label}`);
    return response.data;
};

export const removeLabel = async (id, label) => {
    const response = await api.delete(`/issues/${id}/labels/${label}`);
    return response.data;
};

export const getComments = async (id) => {
    const response = await api.get(`/issues/${id}/comments`);
    return response.data;
};

export const addComment = async (id, content) => {
    const response = await api.post(`/issues/${id}/comments`, { content });
    return response.data;
};

export const getActivities = async (id) => {
    const response = await api.get(`/issues/${id}/activities`);
    return response.data;
};

