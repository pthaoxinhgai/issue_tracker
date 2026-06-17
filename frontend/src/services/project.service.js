import api from './api';

export const projectService = {
  getAll: async () => {
    const response = await api.get('/projects');
    return response.data;
  },

  getById: async (id) => {
    const response = await api.get(`/projects/${id}`);
    return response.data;
  },

  create: async (name, description) => {
    const response = await api.post('/projects', null, {
      params: { name, description }
    });
    return response.data;
  }
};
