import { create } from 'zustand';
import { ClinicalAlarm } from '../mocks/alarms';
import { clinicalAlarmApi } from '../services/clinicalAlarmApi';

interface AlarmState {
  alarms: ClinicalAlarm[];
  isLoading: boolean;
  fetchAlarms: (userId: string) => Promise<void>;
  addAlarm: (
    alarm: { patient: string; content: string; triggerTime: string; remainingMinutes?: number },
    userId?: string
  ) => void;
  toggleAlarm: (id: string) => void;
  deleteAlarm: (id: string) => void;
}

export const useAlarmStore = create<AlarmState>((set, get) => ({
  alarms: [],
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
}));
