import { supabase } from './supabase';
import { Tables, TablesUpdate } from '../types/database';
import { withClockSkewRetry } from '../utils/supabaseRetry';

export interface ProfileItem {
  id: string;
  name: string;
  nickname?: string;
  hospitalName?: string;
  wardName?: string;
  experienceYears?: number;
  role?: 'nurse' | 'head_nurse' | 'student';
  avatarUrl?: string;
  birthDate?: string;
  birthTime?: string;
  calendarType?: 'solar' | 'lunar';
  gender?: 'female' | 'male';
  pushToken?: string;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export const profileApi = {
  // 내 프로필 조회 (P1)
  async getMyProfile(userId: string): Promise<ProfileItem | null> {
    return withClockSkewRetry(async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          // 결과 없음
          return null;
        }
        throw error;
      }

      return {
        id: data.id,
        name: data.name,
        nickname: data.nickname || undefined,
        hospitalName: data.hospital_name || undefined,
        wardName: data.ward_name || undefined,
        experienceYears: data.experience_years ?? 1,
        role: (data.role as any) || 'nurse',
        avatarUrl: data.avatar_url || undefined,
        birthDate: data.birth_date || undefined,
        birthTime: data.birth_time || undefined,
        calendarType: (data.calendar_type as any) || 'solar',
        gender: (data.gender as any) || undefined,
        pushToken: data.push_token || undefined,
        isActive: data.is_active ?? true,
        createdAt: data.created_at || undefined,
        updatedAt: data.updated_at || undefined,
      };
    });
  },

  // 프로필 수정 (P2)
  async updateProfile(userId: string, updates: Partial<ProfileItem>): Promise<boolean> {
    return withClockSkewRetry(async () => {
      const rowUpdates: TablesUpdate<'profiles'> = {
        updated_at: new Date().toISOString(),
      };

      if (updates.name !== undefined) rowUpdates.name = updates.name;
      if (updates.nickname !== undefined) rowUpdates.nickname = updates.nickname;
      if (updates.hospitalName !== undefined) rowUpdates.hospital_name = updates.hospitalName;
      if (updates.wardName !== undefined) rowUpdates.ward_name = updates.wardName;
      if (updates.experienceYears !== undefined) rowUpdates.experience_years = updates.experienceYears;
      if (updates.role !== undefined) rowUpdates.role = updates.role;
      if (updates.avatarUrl !== undefined) rowUpdates.avatar_url = updates.avatarUrl;
      if (updates.birthDate !== undefined) rowUpdates.birth_date = updates.birthDate;
      if (updates.birthTime !== undefined) rowUpdates.birth_time = updates.birthTime;
      if (updates.calendarType !== undefined) rowUpdates.calendar_type = updates.calendarType;
      if (updates.gender !== undefined) rowUpdates.gender = updates.gender;
      if (updates.pushToken !== undefined) rowUpdates.push_token = updates.pushToken;

      const { error } = await supabase
        .from('profiles')
        .update(rowUpdates)
        .eq('id', userId);

      if (error) {
        console.error('Error updating profile:', error);
        throw error;
      }
      return true;
    });
  },

  // 친구 프로필 조회 (P3 - RLS 허용)
  async getFriendProfile(friendId: string): Promise<Partial<ProfileItem> | null> {
    return withClockSkewRetry(async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, name, nickname, hospital_name, ward_name, experience_years, avatar_url')
        .eq('id', friendId)
        .single();

      if (error) {
        return null;
      }

      return {
        id: data.id,
        name: data.name,
        nickname: data.nickname || undefined,
        hospitalName: data.hospital_name || undefined,
        wardName: data.ward_name || undefined,
        experienceYears: data.experience_years ?? 1,
        avatarUrl: data.avatar_url || undefined,
      };
    });
  },
};
