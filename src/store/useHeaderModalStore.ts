import { create } from 'zustand';

interface HeaderModalState {
  notificationModalVisible: boolean;
  myPageModalVisible: boolean;

  openNotifications: () => void;
  closeNotifications: () => void;
  openMyPage: () => void;
  closeMyPage: () => void;
}

export const useHeaderModalStore = create<HeaderModalState>((set) => ({
  notificationModalVisible: false,
  myPageModalVisible: false,

  openNotifications: () => set({ notificationModalVisible: true }),
  closeNotifications: () => set({ notificationModalVisible: false }),
  openMyPage: () => set({ myPageModalVisible: true }),
  closeMyPage: () => set({ myPageModalVisible: false }),
}));

