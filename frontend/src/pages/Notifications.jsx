import React, { useEffect, useState } from 'react';
import { notificationService } from '../api/notificationService';
import { Bell, Check, CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router-dom';

export const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const data = await notificationService.getMyNotifications();
      setNotifications(data);
    } catch (error) {
      console.error('Failed to fetch notifications', error);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (id) => {
    try {
      await notificationService.markAsRead(id);
      setNotifications(notifications.map(n => n.id === id ? { ...n, isRead: true } : n));
    } catch (error) {
      console.error('Failed to mark as read', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await notificationService.markAllAsRead();
      setNotifications(notifications.map(n => ({ ...n, isRead: true })));
    } catch (error) {
      console.error('Failed to mark all as read', error);
    }
  };

  if (loading) return <div className="text-center p-12">Loading notifications...</div>;

  return (
    <div className="max-w-4xl mx-auto space-y-6 px-4 py-8">
      <div className="flex justify-between items-center bg-surface p-6 rounded-xl shadow-lg border border-border">
        <h2 className="text-2xl font-bold flex items-center gap-3">
          <Bell className="text-primary" /> Notifications
        </h2>
        <button 
          onClick={markAllAsRead}
          className="btn-secondary flex items-center gap-2 text-sm"
        >
          <CheckCircle2 size={16} /> Mark All as Read
        </button>
      </div>

      <div className="bg-surface rounded-xl border border-border shadow-lg overflow-hidden">
        {notifications.length === 0 ? (
          <div className="p-8 text-center text-slate-500">
            No notifications yet.
          </div>
        ) : (
          <div className="divide-y divide-border">
            {notifications.map((n) => (
              <div key={n.id} className={`p-5 flex justify-between items-start transition-colors ${!n.isRead ? 'bg-[#313d4a]/30' : 'hover:bg-[#2a3038]'}`}>
                <div className="space-y-1">
                  <p className={`text-sm ${!n.isRead ? 'font-bold text-slate-200' : 'text-slate-400'}`}>
                    {n.message}
                  </p>
                  <div className="flex items-center gap-4 text-xs text-slate-500 font-medium">
                    <span>{new Date(n.createdAt).toLocaleString()}</span>
                    {n.issueId && (
                      <Link to={`/issue/${n.issueId}`} className="text-primary hover:underline">
                        View Issue #{n.issueId}
                      </Link>
                    )}
                  </div>
                </div>
                {!n.isRead && (
                  <button 
                    onClick={() => markAsRead(n.id)}
                    className="p-2 text-slate-400 hover:text-green-400 hover:bg-green-400/10 rounded-full transition-colors"
                    title="Mark as read"
                  >
                    <Check size={18} />
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
