import { supabase } from './supabase';
import { ShiftCode } from '../constants/shiftTypes';
import { Tables, TablesInsert } from '../types/database';
import { withClockSkewRetry } from '../utils/supabaseRetry';
import { useUserStore } from '../store/useUserStore';
import { MOCK_SCHEDULES } from '../mocks/shifts';

export interface ScheduleItem {
  id?: string;
  userId: string;
  date: string; // YYYY-MM-DD
  shiftCode: ShiftCode | string;
  startTime?: string;
  endTime?: string;
  memo?: string;
  source?: 'manual' | 'ocr' | 'ai_recommend';
  createdAt?: string;
  updatedAt?: string;
}

export interface CustomShiftCodeItem {
  id?: string;
  userId: string;
  code: string;
  name: string;
  color: string;
  textColor?: string;
  isOff?: boolean;
}

export const scheduleApi = {
  // 특정 월의 근무 일정 조회 (S1)
  async getMonthlySchedule(userId: string, yearMonth: string): Promise<ScheduleItem[]> {
    if (userId === 'guest_user_preview' || useUserStore.getState().isGuest) {
      return MOCK_SCHEDULES.filter((s) => s.date.startsWith(yearMonth)).map((s, idx) => ({
        id: `mock_sched_${idx}`,
        userId: 'guest_user_preview',
        date: s.date,
        shiftCode: s.shiftCode,
        memo: s.memo,
        source: 'manual',
      }));
    }

    return withClockSkewRetry(async () => {
      const startDate = `${yearMonth}-01`;
      const endDate = `${yearMonth}-31`;

      const { data, error } = await supabase
        .from('schedules')
        .select('*')
        .eq('user_id', userId)
        .gte('date', startDate)
        .lte('date', endDate)
        .order('date', { ascending: true });

      if (error) {
        throw error;
      }

      return (data || []).map((row) => ({
        id: row.id,
        userId: row.user_id,
        date: row.date,
        shiftCode: row.shift_code as ShiftCode,
        startTime: row.start_time || undefined,
        endTime: row.end_time || undefined,
        memo: row.memo || undefined,
        source: (row.source as any) || 'manual',
        createdAt: row.created_at || undefined,
        updatedAt: row.updated_at || undefined,
      }));
    });
  },

  // 근무 일정 추가/수정 (단일 Upsert - S2)
  async saveSchedule(schedule: ScheduleItem): Promise<boolean> {
    if (schedule.userId === 'guest_user_preview' || useUserStore.getState().isGuest) {
      return true;
    }

    return withClockSkewRetry(async () => {
      const { error } = await supabase.from('schedules').upsert(
        {
          user_id: schedule.userId,
          date: schedule.date,
          shift_code: schedule.shiftCode,
          start_time: schedule.startTime || null,
          end_time: schedule.endTime || null,
          memo: schedule.memo || null,
          source: schedule.source || 'manual',
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'user_id, date' }
      );

      if (error) {
        console.error('Error saving schedule:', error);
        throw error;
      }
      return true;
    });
  },

  // 일괄 저장 (OCR 또는 한 달치 근무표 일괄 입력 - S3)
  async saveBulkSchedule(schedules: ScheduleItem[]): Promise<boolean> {
    if (!schedules.length) return true;
    if (useUserStore.getState().isGuest || schedules[0]?.userId === 'guest_user_preview') {
      return true;
    }

    return withClockSkewRetry(async () => {
      const rows = schedules.map((item) => ({
        user_id: item.userId,
        date: item.date,
        shift_code: item.shiftCode,
        start_time: item.startTime || null,
        end_time: item.endTime || null,
        memo: item.memo || null,
        source: item.source || 'manual',
        updated_at: new Date().toISOString(),
      }));

      const { error } = await supabase
        .from('schedules')
        .upsert(rows, { onConflict: 'user_id, date' });

      if (error) {
        console.error('Error bulk saving schedules:', error);
        throw error;
      }
      return true;
    });
  },

  // 근무 일정 삭제 (S4)
  async deleteSchedule(userId: string, date: string): Promise<boolean> {
    if (userId === 'guest_user_preview' || useUserStore.getState().isGuest) {
      return true;
    }

    return withClockSkewRetry(async () => {
      const { error } = await supabase
        .from('schedules')
        .delete()
        .eq('user_id', userId)
        .eq('date', date);

      if (error) {
        console.error('Error deleting schedule:', error);
        throw error;
      }
      return true;
    });
  },

  // 월간 근무 통계 조회 (RPC 함수 - S5)
  async getMonthlyStats(userId: string, yearMonth: string): Promise<Record<string, number>> {
    return withClockSkewRetry(async () => {
      const { data, error } = await supabase.rpc('get_monthly_stats', {
        p_user_id: userId,
        p_year_month: yearMonth,
      });

      if (error) {
        console.warn('Notice getting monthly stats (fallback to empty):', error);
        return {};
      }

      return (data as Record<string, number>) || {};
    });
  },

  // 커스텀 듀티 코드 목록 조회 (S6)
  async getCustomShiftCodes(userId: string): Promise<CustomShiftCodeItem[]> {
    return withClockSkewRetry(async () => {
      const { data, error } = await supabase
        .from('custom_shift_codes')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: true });

      if (error) {
        console.warn('Notice fetching custom shift codes:', error);
        return [];
      }

      return (data || []).map((row) => ({
        id: row.id,
        userId: row.user_id,
        code: row.code,
        name: row.name,
        color: row.color,
        textColor: row.text_color || undefined,
        isOff: row.is_off || false,
      }));
    });
  },

  // 커스텀 듀티 코드 추가/수정 (S7)
  async saveCustomShiftCode(item: CustomShiftCodeItem): Promise<boolean> {
    return withClockSkewRetry(async () => {
      const { error } = await supabase.from('custom_shift_codes').upsert(
        {
          user_id: item.userId,
          code: item.code,
          name: item.name,
          color: item.color,
          text_color: item.textColor || null,
          is_off: item.isOff ?? false,
        },
        { onConflict: 'user_id, code' }
      );

      if (error) {
        console.error('Error saving custom shift code:', error);
        throw error;
      }
      return true;
    });
  },
};
