import { supabase } from './supabase';
import { withClockSkewRetry } from '../utils/supabaseRetry';

export interface ClinicalAlarmItem {
  id: string;
  userId: string;
  patient: string;
  content: string;
  triggerTime: string; // ISO string or human-readable format
  isActive: boolean;
  isTriggered?: boolean;
  createdAt?: string;
}

export const clinicalAlarmApi = {
  // 특정 사용자의 활성/전체 알람 목록 조회
  async getAlarms(userId: string): Promise<ClinicalAlarmItem[]> {
    return withClockSkewRetry(async () => {
      const { data, error } = await supabase
        .from('clinical_alarms')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        console.warn('Error fetching clinical alarms:', error);
        return [];
      }

      return (data || []).map((row) => ({
        id: row.id,
        userId: row.user_id,
        patient: row.patient,
        content: row.content,
        triggerTime: row.trigger_time,
        isActive: row.is_active ?? true,
        isTriggered: row.is_triggered ?? false,
        createdAt: row.created_at,
      }));
    });
  },

  // 새 임상 알람 추가
  async addAlarm(alarm: {
    userId: string;
    patient: string;
    content: string;
    triggerTime: string;
  }): Promise<ClinicalAlarmItem | null> {
    return withClockSkewRetry(async () => {
      const { data, error } = await supabase
        .from('clinical_alarms')
        .insert({
          user_id: alarm.userId,
          patient: alarm.patient,
          content: alarm.content,
          trigger_time: alarm.triggerTime,
          is_active: true,
          is_triggered: false,
        })
        .select()
        .single();

      if (error) {
        console.error('Error adding clinical alarm:', error);
        throw error;
      }

      return {
        id: data.id,
        userId: data.user_id,
        patient: data.patient,
        content: data.content,
        triggerTime: data.trigger_time,
        isActive: data.is_active ?? true,
        isTriggered: data.is_triggered ?? false,
        createdAt: data.created_at,
      };
    });
  },

  // 알람 on/off 토글
  async toggleAlarm(id: string, isActive: boolean): Promise<boolean> {
    return withClockSkewRetry(async () => {
      const { error } = await supabase
        .from('clinical_alarms')
        .update({ is_active: isActive })
        .eq('id', id);

      if (error) {
        console.error('Error toggling clinical alarm:', error);
        return false;
      }
      return true;
    });
  },

  // 알람 삭제
  async deleteAlarm(id: string): Promise<boolean> {
    return withClockSkewRetry(async () => {
      const { error } = await supabase
        .from('clinical_alarms')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting clinical alarm:', error);
        return false;
      }
      return true;
    });
  },
};

