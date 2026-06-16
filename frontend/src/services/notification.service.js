import api from './api';

export const getMyNotifications = async () => {
    const response = await api.get('/notifications');
    return response.data;
};

export const getUnreadCount = async () => {
    const response = await api.get('/notifications/unread-count');
    return response.data;
};

export const markAsRead = async (id) => {
    const response = await api.patch(`/notifications/${id}/read`);
    return response.data;
};

export const markAllAsRead = async () => {
    const response = await api.patch('/notifications/read-all');
    return response.data;
};
