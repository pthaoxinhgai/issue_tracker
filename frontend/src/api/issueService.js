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
  addComment: async (id, content, isInternal = false) => {
    const response = await api.post(`/issues/${id}/comments`, { content, isInternal });
    return response.data;
  },
  escalate: async (id, reason, impactLevel, evidence) => {
    const params = new URLSearchParams({ reason, impactLevel, evidence });
    const response = await api.post(`/issues/${id}/escalate?${params.toString()}`);
    return response.data;
  },
  link: async (id, targetId, linkType) => {
    const params = new URLSearchParams({ linkType });
    const response = await api.post(`/issues/${id}/link/${targetId}?${params.toString()}`);
    return response.data;
  },
  search: async (query) => {
    const response = await api.get(`/issues/search?query=${encodeURIComponent(query)}`);
    return response.data;
  },
  merge: async (duplicateId, primaryId) => {
    const response = await api.post(`/issues/${duplicateId}/merge/${primaryId}`);
    return response.data;
  },
  changeStatus: async (id, newStatus) => {
    const params = new URLSearchParams({ newStatus });
    const response = await api.patch(`/issues/${id}/status?${params.toString()}`);
    return response.data;
  }
};
