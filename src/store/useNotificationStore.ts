import { create } from 'zustand';
import { NotificationItem, MOCK_NOTIFICATIONS } from '../mocks/notificationsData';

interface NotificationState {
  notifications: NotificationItem[];
  unreadCount: number;

  // Actions
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  deleteNotification: (id: string) => void;
}

export const useNotificationStore = create<NotificationState>((set) => ({
  notifications: MOCK_NOTIFICATIONS,
  unreadCount: MOCK_NOTIFICATIONS.filter((n) => !n.isRead).length,

  markAsRead: (id: string) =>
    set((state) => {
      const updated = state.notifications.map((n) =>
        n.id === id ? { ...n, isRead: true } : n
      );
      return {
        notifications: updated,
        unreadCount: updated.filter((n) => !n.isRead).length,
      };
    }),

  markAllAsRead: () =>
    set((state) => {
      const updated = state.notifications.map((n) => ({ ...n, isRead: true }));
      return {
        notifications: updated,
        unreadCount: 0,
      };
    }),

  deleteNotification: (id: string) =>
    set((state) => {
      const updated = state.notifications.filter((n) => n.id !== id);
      return {
        notifications: updated,
        unreadCount: updated.filter((n) => !n.isRead).length,
      };
    }),
}));

