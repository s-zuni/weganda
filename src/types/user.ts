export type AppThemeColor = 'pink' | 'deepGreen' | 'deepBlue' | 'yellow' | 'purple';

export interface UserProfile {
  id: string;
  email?: string | null;
  name: string;
  nickname: string;
  hospitalName: string;
  wardName: string;
  experienceYears: number;
  avatarUrl?: string;
}

export interface UserMembership {
  isPremium: boolean;
  monthlyFortuneCount: number;
  appThemeColor: AppThemeColor;
}

