import api from './api';

export const uploadAttachment = async (issueId, file) => {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await api.post(`/issues/${issueId}/attachments`, formData, {
        headers: {
            'Content-Type': 'multipart/form-data'
        }
    });
    return response.data;
};

export const getAttachments = async (issueId) => {
    const response = await api.get(`/issues/${issueId}/attachments`);
    return response.data;
};
