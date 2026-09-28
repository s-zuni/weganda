import { create } from 'zustand';

interface HeaderModalState {
  notificationModalVisible: boolean;
  myPageModalVisible: boolean;
  alarmModalVisible: boolean;

  openNotifications: () => void;
  closeNotifications: () => void;
  openMyPage: () => void;
  closeMyPage: () => void;
  openAlarm: () => void;
  closeAlarm: () => void;
}

export const useHeaderModalStore = create<HeaderModalState>((set) => ({
  notificationModalVisible: false,
  myPageModalVisible: false,
  alarmModalVisible: false,

  openNotifications: () => set({ notificationModalVisible: true }),
  closeNotifications: () => set({ notificationModalVisible: false }),
  openMyPage: () => set({ myPageModalVisible: true }),
  closeMyPage: () => set({ myPageModalVisible: false }),
  openAlarm: () => set({ alarmModalVisible: true }),
  closeAlarm: () => set({ alarmModalVisible: false }),
}));

