import api from './axiosConfig';

export const userService = {
  getAll: async () => {
    const response = await api.get('/users');
    return response.data;
  }
};
