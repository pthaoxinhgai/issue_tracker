package com.issuetracker.backend.service;

import com.issuetracker.backend.domain.entity.User;
import com.issuetracker.backend.dto.response.NotificationDto;

import java.util.List;

public interface NotificationService {
    void createNotification(User user, String message, Long issueId);
    List<NotificationDto> getMyNotifications();
    long getUnreadCount();
    void markAsRead(Long notificationId);
    void markAllAsRead();
}
