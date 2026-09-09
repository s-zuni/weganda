import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { scheduleApi } from '../services/scheduleApi';
import { ExpoSecureStoreAdapter } from '../services/supabase';

export interface CustomShiftCode {
  code: string;
  name: string;
  color: string;
  textColor: string;
  isOff?: boolean; // 병동별 오프/휴무 표기 여부 (복수 오프 기호 매핑)
}

export const DEFAULT_SHIFT_CODES: Record<string, CustomShiftCode> = {
  D: { code: 'D', name: '데이', color: '#4F98CA', textColor: '#FFFFFF' },
  E: { code: 'E', name: '이브닝', color: '#E2703A', textColor: '#FFFFFF' },
  N: { code: 'N', name: '나이트', color: '#272727', textColor: '#FFFFFF' },
  O: { code: 'O', name: '오프', color: '#E84A5F', textColor: '#FFFFFF', isOff: true },
  '/': { code: '/', name: '슬래시오프(/)', color: '#E84A5F', textColor: '#FFFFFF', isOff: true },
  OFF: { code: 'OFF', name: '오프(OFF)', color: '#E84A5F', textColor: '#FFFFFF', isOff: true },
  V: { code: 'V', name: '휴가/연차', color: '#9B51E0', textColor: '#FFFFFF', isOff: true },
  F: { code: 'F', name: '오프(F)', color: '#E84A5F', textColor: '#FFFFFF', isOff: true },
  M: { code: 'M', name: '미드', color: '#10B981', textColor: '#FFFFFF' },
};

// 기본 초기 스케줄
const INITIAL_AUGUST_SCHEDULES: Record<string, string> = {
  '2026-08-01': 'D', '2026-08-02': 'D', '2026-08-03': 'E', '2026-08-04': 'E',
  '2026-08-05': 'O', '2026-08-06': 'O', '2026-08-07': 'N', '2026-08-08': 'N',
  '2026-08-09': 'O', '2026-08-10': 'D', '2026-08-11': 'D', '2026-08-12': 'E',
  '2026-08-13': 'E', '2026-08-14': 'O', '2026-08-15': 'V', '2026-08-16': 'V',
  '2026-08-17': 'D', '2026-08-18': 'D', '2026-08-19': 'D', '2026-08-20': 'O',
  '2026-08-21': 'O', '2026-08-22': 'E', '2026-08-23': 'N', '2026-08-24': 'N',
  '2026-08-25': 'O', '2026-08-26': 'D', '2026-08-27': 'D', '2026-08-28': 'E',
  '2026-08-29': 'E', '2026-08-30': 'O', '2026-08-31': 'O',
};

interface ShiftScheduleState {
  currentDate: Date;
  schedules: Record<string, string>; // "YYYY-MM-DD": "D"
  customCodes: Record<string, CustomShiftCode>;
  isLoading: boolean;

  // Actions
  fetchMonthlySchedule: (userId: string, yearMonth?: string) => Promise<void>;
  setShiftForDate: (dateStr: string, code: string, userId?: string) => Promise<void>;
  changeMonth: (offset: number, userId?: string) => void;
  setCurrentDate: (date: Date) => void;
  updateCustomCode: (code: string, name: string, color: string, isOff?: boolean, userId?: string) => Promise<void>;
  deleteCustomCode: (code: string) => void;
  getOffCodes: () => string[];
  applyUploadedSchedules: (newSchedules: Record<string, string>, userId?: string) => Promise<void>;
}

export const useShiftScheduleStore = create<ShiftScheduleState>()(
  persist(
    (set, get) => ({
      currentDate: new Date(),
      schedules: INITIAL_AUGUST_SCHEDULES,
      customCodes: DEFAULT_SHIFT_CODES,
      isLoading: false,

  // 특정 월의 스케줄 DB에서 불러오기
  fetchMonthlySchedule: async (userId: string, yearMonth?: string) => {
    try {
      set({ isLoading: true });
      const ym = yearMonth || get().currentDate.toISOString().slice(0, 7);
      const items = await scheduleApi.getMonthlySchedule(userId, ym);

      if (items && items.length > 0) {
        const scheduleMap: Record<string, string> = { ...get().schedules };
        items.forEach((item) => {
          scheduleMap[item.date] = item.shiftCode;
        });
        set({ schedules: scheduleMap });
      }

      // 커스텀 근무 코드도 백엔드에서 동기화
      try {
        const remoteCustomCodes = await scheduleApi.getCustomShiftCodes(userId);
        if (remoteCustomCodes && remoteCustomCodes.length > 0) {
          const merged = { ...get().customCodes };
          remoteCustomCodes.forEach((c) => {
            merged[c.code] = {
              code: c.code,
              name: c.name,
              color: c.color,
              textColor: c.textColor || '#FFFFFF',
              isOff: c.isOff || false,
            };
          });
          set({ customCodes: merged });
        }
      } catch (err) {
        console.warn('Notice syncing custom codes:', err);
      }

      set({ isLoading: false });
    } catch (e: any) {
      console.warn('Notice in fetchMonthlySchedule:', e?.message || e);
      set({ isLoading: false });
    }
  },

  // 근무 듀티 설정 (낙관적 UI 반영 + DB 저장)
  setShiftForDate: async (dateStr, code, userId) => {
    set((state) => ({
      schedules: {
        ...state.schedules,
        [dateStr]: code,
      },
    }));

    // userId가 있으면 Supabase DB에도 저장
    if (userId) {
      try {
        await scheduleApi.saveSchedule({
          userId,
          date: dateStr,
          shiftCode: code as any,
        });
      } catch (e) {
        console.error('Failed to sync shift with backend:', e);
      }
    }
  },

  changeMonth: (offset, userId) => {
    const year = get().currentDate.getFullYear();
    const month = get().currentDate.getMonth();
    const newDate = new Date(year, month + offset, 1);
    set({ currentDate: newDate });

    if (userId) {
      const ym = `${newDate.getFullYear()}-${String(newDate.getMonth() + 1).padStart(2, '0')}`;
      get().fetchMonthlySchedule(userId, ym);
    }
  },

  setCurrentDate: (date) => set({ currentDate: date }),

  updateCustomCode: async (code, name, color, isOff = false, userId) => {
    set((state) => ({
      customCodes: {
        ...state.customCodes,
        [code]: {
          code,
          name,
          color,
          textColor: '#FFFFFF',
          isOff,
        },
      },
    }));

    if (userId) {
      try {
        await scheduleApi.saveCustomShiftCode({
          userId,
          code,
          name,
          color,
          textColor: '#FFFFFF',
          isOff,
        });
      } catch (e) {
        console.error('Failed to save custom shift code:', e);
      }
    }
  },

  deleteCustomCode: (code) => {
    set((state) => {
      const nextCodes = { ...state.customCodes };
      delete nextCodes[code];
      return { customCodes: nextCodes };
    });
  },

  getOffCodes: () => {
    const codes = get().customCodes;
    const offList = Object.values(codes)
      .filter((c) => c.isOff || c.code === 'O' || c.name.includes('오프') || c.name.includes('휴'))
      .map((c) => c.code);
    return offList.length > 0 ? offList : ['O', '/', 'OFF'];
  },

  // OCR 또는 일괄 업로드된 스케줄 적용 및 DB 일괄 동기화
  applyUploadedSchedules: async (newSchedules, userId) => {
    set((state) => ({
      schedules: {
        ...state.schedules,
        ...newSchedules,
      },
    }));

    if (userId) {
      try {
        const scheduleList = Object.entries(newSchedules).map(([date, shiftCode]) => ({
          userId,
          date,
          shiftCode: shiftCode as any,
          source: 'ocr' as const,
        }));
        await scheduleApi.saveBulkSchedule(scheduleList);
      } catch (e) {
        console.error('Failed to bulk save schedules to backend:', e);
      }
    }
  },
}),
    {
      name: 'weganda-shift-schedule-store',
      storage: createJSONStorage(() => ExpoSecureStoreAdapter),
      partialize: (state) => ({
        schedules: state.schedules,
        customCodes: state.customCodes,
      }),
    }
  )
);

