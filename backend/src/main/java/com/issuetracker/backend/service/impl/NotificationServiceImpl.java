package com.issuetracker.backend.service.impl;

import com.issuetracker.backend.domain.entity.Notification;
import com.issuetracker.backend.domain.entity.User;
import com.issuetracker.backend.dto.response.NotificationDto;
import com.issuetracker.backend.repository.NotificationRepository;
import com.issuetracker.backend.repository.UserRepository;
import com.issuetracker.backend.security.SecurityUtils;
import com.issuetracker.backend.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
@RequiredArgsConstructor
public class NotificationServiceImpl implements NotificationService {

    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;

    private final com.issuetracker.backend.repository.IssueRepository issueRepository;

    @Override
    public void createNotification(User user, String message, Long issueId) {
        Notification notification = Notification.builder()
                .user(user)
                .message(message)
                .issue(issueId != null ? issueRepository.getReferenceById(issueId) : null)
                .type("SYSTEM")
                .isRead(false)
                .build();
        notificationRepository.save(notification);
    }

    private User getCurrentUser() {
        String email = SecurityUtils.getCurrentUserEmail();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Current user not found"));
    }

    @Override
    public List<NotificationDto> getMyNotifications() {
        User user = getCurrentUser();
        return notificationRepository.findByUserIdOrderByCreatedAtDesc(user.getId())
                .stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Override
    public long getUnreadCount() {
        User user = getCurrentUser();
        return notificationRepository.countByUserIdAndIsReadFalse(user.getId());
    }

    @Override
    public void markAsRead(Long notificationId) {
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new RuntimeException("Notification not found"));
        
        User currentUser = getCurrentUser();
        if (!notification.getUser().getId().equals(currentUser.getId())) {
            throw new RuntimeException("Access Denied");
        }
        
        notification.setRead(true);
        notificationRepository.save(notification);
    }

    @Override
    public void markAllAsRead() {
        User user = getCurrentUser();
        List<Notification> unread = notificationRepository.findByUserIdAndIsReadFalse(user.getId());
        unread.forEach(n -> n.setRead(true));
        notificationRepository.saveAll(unread);
    }

    private NotificationDto mapToDto(Notification n) {
        return NotificationDto.builder()
                .id(n.getId())
                .message(n.getMessage())
                .issueId(n.getIssue() != null ? n.getIssue().getId() : null)
                .isRead(n.isRead())
                .createdAt(n.getCreatedAt())
                .build();
    }
}
