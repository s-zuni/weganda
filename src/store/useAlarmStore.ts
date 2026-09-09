import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { ClinicalAlarm } from '../types/alarm';
import { clinicalAlarmApi } from '../services/clinicalAlarmApi';
import { ExpoSecureStoreAdapter } from '../services/supabase';

export interface CustomAlarmPreset {
  id: string;
  label: string;
  minutes: number;
  hint: string;
  isPinned: boolean;
}

const DEFAULT_PRESETS: CustomAlarmPreset[] = [
  { id: 'preset_ast', label: '+15분', minutes: 15, hint: '💉 항생제 AST 알러지 확인', isPinned: true },
  { id: 'preset_transfusion', label: '+15분', minutes: 15, hint: '🩸 수혈 1차 바이탈 모니터링', isPinned: true },
  { id: 'preset_bst', label: '+30분', minutes: 30, hint: '🩺 식후 혈당(BST) 재측정', isPinned: true },
  { id: 'preset_fluid', label: '+60분', minutes: 60, hint: '💧 수액 잔여량 & 주입속도 점검', isPinned: false },
  { id: 'preset_drain', label: '+120분', minutes: 120, hint: '🧪 배액관(H/V) 배액량 체크', isPinned: false },
];

interface AlarmState {
  alarms: ClinicalAlarm[];
  customPresets: CustomAlarmPreset[];
  isLoading: boolean;
  fetchAlarms: (userId: string) => Promise<void>;
  addAlarm: (
    alarm: { patient: string; content: string; triggerTime: string; remainingMinutes?: number },
    userId?: string
  ) => void;
  toggleAlarm: (id: string) => void;
  deleteAlarm: (id: string) => void;
  addCustomPreset: (preset: Omit<CustomAlarmPreset, 'id'>) => void;
  deleteCustomPreset: (id: string) => void;
  togglePinPreset: (id: string) => void;
}

export const useAlarmStore = create<AlarmState>()(
  persist(
    (set, get) => ({
  alarms: [],
  customPresets: DEFAULT_PRESETS,
  isLoading: false,


  // Supabase DB에서 알람 목록 조회
  fetchAlarms: async (userId: string) => {
    try {
      set({ isLoading: true });
      const serverAlarms = await clinicalAlarmApi.getAlarms(userId);
      if (serverAlarms && serverAlarms.length > 0) {
        const mapped: ClinicalAlarm[] = serverAlarms.map((a) => {
          let triggerLabel = a.triggerTime;
          try {
            const date = new Date(a.triggerTime);
            if (!isNaN(date.getTime())) {
              triggerLabel = date.toLocaleTimeString('ko-KR', {
                hour: '2-digit',
                minute: '2-digit',
                hour12: false,
              });
            }
          } catch {}

          return {
            id: a.id,
            patient: a.patient,
            content: a.content,
            triggerTime: triggerLabel,
            isActive: a.isActive,
            createdAt: a.createdAt
              ? new Date(a.createdAt).toLocaleTimeString('ko-KR', {
                  hour: '2-digit',
                  minute: '2-digit',
                  hour12: false,
                })
              : '방금 전',
          };
        });
        set({ alarms: mapped, isLoading: false });
      } else {
        set({ alarms: [], isLoading: false });
      }
    } catch (e) {
      console.warn('Error fetching clinical alarms from backend:', e);
      set({ isLoading: false });
    }
  },

  // 알람 등록 (낙관적 UI + Supabase DB 저장)
  addAlarm: (newAlarm, userId) => {
    const localId = `alarm_${Date.now()}`;
    const newEntry: ClinicalAlarm = {
      ...newAlarm,
      id: localId,
      isActive: true,
      createdAt: new Date().toLocaleTimeString('ko-KR', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
      }),
    };

    set((state) => ({
      alarms: [newEntry, ...state.alarms],
    }));

    if (userId) {
      const targetTimeIso = new Date(
        Date.now() + (newAlarm.remainingMinutes || 15) * 60 * 1000
      ).toISOString();

      clinicalAlarmApi
        .addAlarm({
          userId,
          patient: newAlarm.patient,
          content: newAlarm.content,
          triggerTime: targetTimeIso,
        })
        .then((saved) => {
          if (saved) {
            // 로컬 임시 id를 DB의 UUID로 교체
            set((state) => ({
              alarms: state.alarms.map((a) => (a.id === localId ? { ...a, id: saved.id } : a)),
            }));
          }
        })
        .catch((e) => console.warn('Failed to add alarm to backend:', e));
    }
  },

  toggleAlarm: (id) => {
    const current = get().alarms.find((a) => a.id === id);
    if (!current) return;
    const nextActive = !current.isActive;

    set((state) => ({
      alarms: state.alarms.map((a) => (a.id === id ? { ...a, isActive: nextActive } : a)),
    }));

    if (!id.startsWith('alarm_')) {
      clinicalAlarmApi.toggleAlarm(id, nextActive).catch((e) => {
        console.warn('Failed to toggle alarm on backend:', e);
      });
    }
  },

  deleteAlarm: (id) => {
    set((state) => ({
      alarms: state.alarms.filter((a) => a.id !== id),
    }));

    if (!id.startsWith('alarm_')) {
      clinicalAlarmApi.deleteAlarm(id).catch((e) => {
        console.warn('Failed to delete alarm on backend:', e);
      });
    }
  },

  addCustomPreset: (preset) => {
    const newPreset: CustomAlarmPreset = {
      ...preset,
      id: `preset_${Date.now()}`,
    };
    set((state) => ({
      customPresets: [newPreset, ...state.customPresets],
    }));
  },

  deleteCustomPreset: (id) => {
    set((state) => ({
      customPresets: state.customPresets.filter((p) => p.id !== id),
    }));
  },

  togglePinPreset: (id) => {
    set((state) => ({
      customPresets: state.customPresets.map((p) =>
        p.id === id ? { ...p, isPinned: !p.isPinned } : p
      ),
    }));
  },
}),
    {
      name: 'weganda-alarm-store',
      storage: createJSONStorage(() => ExpoSecureStoreAdapter),
      partialize: (state) => ({
        alarms: state.alarms,
        customPresets: state.customPresets,
      }),
    }
  )
);

