import api from './api';

export const importIssues = async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await api.post('/issues/import', formData, {
        headers: {
            'Content-Type': 'multipart/form-data'
        }
    });
    return response.data;
};
