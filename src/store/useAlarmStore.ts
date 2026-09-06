import { create } from 'zustand';
import { ClinicalAlarm, INITIAL_ALARMS } from '../mocks/alarms';

interface AlarmState {
  alarms: ClinicalAlarm[];
  addAlarm: (alarm: { patient: string; content: string; triggerTime: string; remainingMinutes?: number }) => void;
  toggleAlarm: (id: string) => void;
  deleteAlarm: (id: string) => void;
}

export const useAlarmStore = create<AlarmState>((set) => ({
  alarms: INITIAL_ALARMS,

  addAlarm: (newAlarm) =>
    set((state) => ({
      alarms: [
        {
          ...newAlarm,
          id: `alarm_${Date.now()}`,
          isActive: true,
          createdAt: new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit', hour12: false }),
        },
        ...state.alarms,
      ],
    })),

  toggleAlarm: (id) =>
    set((state) => ({
      alarms: state.alarms.map((a) =>
        a.id === id ? { ...a, isActive: !a.isActive } : a
      ),
    })),

  deleteAlarm: (id) =>
    set((state) => ({
      alarms: state.alarms.filter((a) => a.id !== id),
    })),
}));

