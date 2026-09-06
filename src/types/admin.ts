export type UserRole = 'admin' | 'plus' | 'user';

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  tier?: string;
  isActive: boolean;
  credits?: number;
  createdAt: string;
  updatedAt?: string;
  hospitalName?: string;
  wardName?: string;
}

export type ReportStatus = 'pending' | 'resolved' | 'dismissed';

export interface AdminReport {
  id: string;
  reporterId: string;
  postId?: string;
  commentId?: string;
  reason: string;
  status: ReportStatus;
  createdAt: string;
  postTitle?: string;
  postContent?: string;
  commentContent?: string;
  authorNickname?: string;
}

export interface AdminPost {
  id: string;
  title: string;
  content: string;
  userId: string;
  authorNickname: string;
  tag: string;
  likes: number;
  views: number;
  isNotice: boolean;
  isDeleted: boolean;
  createdAt: string;
  commentsCount?: number;
}

export interface AdminComment {
  id: string;
  postId: string;
  userId: string;
  content: string;
  authorName: string;
  isDeleted: boolean;
  createdAt: string;
}

export interface AdminServiceStat {
  service_key: string;
  service_name: string;
  total_duration: number;
  avg_duration: number;
  unique_users: number;
  visit_count: number;
  duration_share: number;
}

export interface AdminDailyTrend {
  date: string;
  session_count: number;
  unique_users: number;
  avg_duration: number;
  total_duration: number;
}

export interface AdminDeviceStat {
  device_type: string;
  session_count: number;
  unique_users: number;
  total_duration: number;
}

export interface AdminAnalytics {
  overview: {
    total_duration_seconds: number;
    avg_duration_seconds: number;
    total_sessions: number;
    unique_users: number;
    active_now: number;
    retention_rate: number;
  };
  service_stats: AdminServiceStat[];
  daily_trends: AdminDailyTrend[];
  device_stats: AdminDeviceStat[];
  monthly_revenue: {
    status: 'pending_pg';
    amount: number;
    label: string;
  };
}
