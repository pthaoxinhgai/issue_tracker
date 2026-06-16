import api from './api';

export const getAllUsers = async () => {
    const response = await api.get('/users');
    return response.data;
};

export const changeUserRole = async (userId, newRole) => {
    const response = await api.put(`/users/${userId}/role?role=${newRole}`);
    return response.data;
};
