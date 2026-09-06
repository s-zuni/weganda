import { supabase } from './supabase';

export interface NotificationItem {
  id: string;
  userId: string;
  type: 'swap' | 'shift' | 'comment' | 'friend' | 'system';
  title: string;
  message: string;
  relatedId?: string;
  isRead: boolean;
  createdAt: string;
}

export const notificationApi = {
  // 알림 목록 조회 (N1)
  async getNotifications(userId: string): Promise<NotificationItem[]> {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching notifications:', error);
      throw error;
    }

    return (data || []).map((row) => ({
      id: row.id,
      userId: row.user_id,
      type: (row.type as any) || 'system',
      title: row.title,
      message: row.message,
      relatedId: row.related_id || undefined,
      isRead: row.is_read ?? false,
      createdAt: row.created_at || new Date().toISOString(),
    }));
  },

  // 개별 알림 읽음 처리 (N2)
  async markAsRead(notificationId: string): Promise<boolean> {
    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('id', notificationId);

    if (error) {
      console.error('Error marking notification as read:', error);
      throw error;
    }
    return true;
  },

  // 전체 알림 읽음 처리 (N2)
  async markAllAsRead(userId: string): Promise<boolean> {
    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('user_id', userId)
      .eq('is_read', false);

    if (error) {
      console.error('Error marking all notifications as read:', error);
      throw error;
    }
    return true;
  },

  // 알림 삭제 (N3)
  async deleteNotification(notificationId: string): Promise<boolean> {
    const { error } = await supabase
      .from('notifications')
      .delete()
      .eq('id', notificationId);

    if (error) {
      console.error('Error deleting notification:', error);
      throw error;
    }
    return true;
  },
};

