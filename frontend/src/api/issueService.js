import api from './axiosConfig';

export const issueService = {
  getAll: async () => {
    const response = await api.get('/issues');
    return response.data;
  },
  getById: async (id) => {
    const response = await api.get(`/issues/${id}`);
    return response.data;
  },
  create: async (issueData) => {
    const response = await api.post('/issues', issueData);
    return response.data;
  },
  update: async (id, issueData) => {
    const response = await api.put(`/issues/${id}`, issueData);
    return response.data;
  },
  assign: async (id, userId) => {
    const response = await api.post(`/issues/${id}/assign/${userId}`);
    return response.data;
  },
  getComments: async (id) => {
    const response = await api.get(`/issues/${id}/comments`);
    return response.data;
  },
  addComment: async (id, content) => {
    const response = await api.post(`/issues/${id}/comments`, { content });
    return response.data;
  }
};
