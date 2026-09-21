import { create } from 'zustand';
import { NotificationItem } from '../mocks/notificationsData';
import { notificationApi, generateRealClinicalNotifications } from '../services/notificationApi';
import { useUserStore } from './useUserStore';

interface NotificationState {
  notifications: NotificationItem[];
  unreadCount: number;
  isLoading: boolean;

  // Actions
  loadNotifications: () => Promise<void>;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  deleteNotification: (id: string) => void;
}

const initialNotifications = generateRealClinicalNotifications();

export const useNotificationStore = create<NotificationState>((set, get) => ({
  notifications: initialNotifications,
  unreadCount: initialNotifications.filter((n) => !n.isRead).length,
  isLoading: false,

  loadNotifications: async () => {
    try {
      set({ isLoading: true });
      const userId = useUserStore.getState().id;
      const list = await notificationApi.fetchNotifications(userId ?? undefined);
      set({
        notifications: list,
        unreadCount: list.filter((n) => !n.isRead).length,
        isLoading: false,
      });
    } catch (e) {
      console.warn('Error loading notifications:', e);
      set({ isLoading: false });
    }
  },

  markAsRead: async (id: string) => {
    const updated = get().notifications.map((n) =>
      n.id === id ? { ...n, isRead: true } : n
    );
    set({
      notifications: updated,
      unreadCount: updated.filter((n) => !n.isRead).length,
    });
    await notificationApi.markAsRead(id);
  },

  markAllAsRead: async () => {
    const userId = useUserStore.getState().id;
    const updated = get().notifications.map((n) => ({ ...n, isRead: true }));
    set({
      notifications: updated,
      unreadCount: 0,
    });
    await notificationApi.markAllAsRead(userId ?? undefined);
  },

  deleteNotification: (id: string) => {
    const updated = get().notifications.filter((n) => n.id !== id);
    set({
      notifications: updated,
      unreadCount: updated.filter((n) => !n.isRead).length,
    });
  },
}));
