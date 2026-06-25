import api from './api';

export const reportService = {
  createReport: async (reportData) => {
    const response = await api.post('/reports', reportData);
    return response.data;
  },

  getAllReports: async () => {
    const response = await api.get('/reports');
    return response.data;
  },

  getMyReports: async () => {
    const response = await api.get('/reports/my');
    return response.data;
  },

  getReportById: async (id) => {
    const response = await api.get(`/reports/${id}`);
    return response.data;
  },

  changeStatus: async (id, status) => {
    const response = await api.patch(`/reports/${id}/status?newStatus=${status}`);
    return response.data;
  },

  deleteReport: async (id) => {
    const response = await api.delete(`/reports/${id}`);
    return response.data;
  },

  createIssueFromReport: async (id, issueData) => {
    const response = await api.post(`/reports/${id}/issues`, issueData);
    return response.data;
  },

  getComments: async (id) => {
    const response = await api.get(`/reports/${id}/comments`);
    return response.data;
  },

  addComment: async (id, content) => {
    const response = await api.post(`/reports/${id}/comments`, { content });
    return response.data;
  },

  getActivities: async (id) => {
    const response = await api.get(`/reports/${id}/activities`);
    return response.data;
  }
};
