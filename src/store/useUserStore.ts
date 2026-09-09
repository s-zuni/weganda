import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { supabase, ExpoSecureStoreAdapter } from '../services/supabase';
import { profileApi, ProfileItem } from '../services/profileApi';
import { useFortuneStore } from './useFortuneStore';

export type AppThemeColor = 'pink' | 'deepGreen' | 'deepBlue' | 'yellow' | 'purple';

export interface UserState {
  id: string | null;
  email: string | null;
  name: string;
  nickname: string;
  hospitalName: string;
  wardName: string;
  experienceYears: number;
  avatarUrl?: string;
  isAuthenticated: boolean;
  isLoading: boolean;

  // weganda+ 프리미엄 멤버십 & 유저 역할
  role: 'admin' | 'plus' | 'user';
  isPremium: boolean;
  monthlyFortuneCount: number;
  appThemeColor: AppThemeColor;

  // Role & Premium Actions
  isAdmin: () => boolean;
  setUserRole: (role: 'admin' | 'plus' | 'user') => void;
  subscribeToPremium: () => void;
  unsubscribePremium: () => void;
  incrementFortuneCount: () => void;
  setAppThemeColor: (color: AppThemeColor) => void;

  // Actions
  setUser: (user: Partial<UserState>) => void;
  syncUserFromSession: (session: any) => Promise<void>;
  clearUser: () => void;
  initializeAuth: () => Promise<void>;
  updateUserProfile: (updates: Partial<ProfileItem>) => Promise<boolean>;
}

export const useUserStore = create<UserState>()(
  persist(
    (set, get) => ({
  id: '33072254-77c4-461a-a83f-8402b9df33c4',
  email: 'zxzx729@gmail.com',
  name: '이승준',
  nickname: '이승준',
  hospitalName: '우간다 서울병원',
  wardName: '71병동',
  experienceYears: 3,
  avatarUrl: undefined,
  isAuthenticated: true,
  isLoading: false,

  role: 'admin',
  isPremium: true,
  monthlyFortuneCount: 0,
  appThemeColor: 'pink' as AppThemeColor,

  isAdmin: () => get().role === 'admin',
  setUserRole: (role) => set({ role, isPremium: role === 'plus' || role === 'admin' }),

  setUser: (user) => set((state) => ({ ...state, ...user })),

  // Mock 결제 성공 — 프리미엄 구독 활성화
  subscribeToPremium: () => set({ isPremium: true }),

  // 구독 해지
  unsubscribePremium: () => set({ isPremium: false, appThemeColor: 'pink' as AppThemeColor }),

  // 무료 운세 횟수 카운트 증가
  incrementFortuneCount: () => set((state) => ({ monthlyFortuneCount: state.monthlyFortuneCount + 1 })),

  // 앱 테마 컬러 변경 (프리미엄 전용)
  setAppThemeColor: (color: AppThemeColor) => set({ appThemeColor: color }),

  // 세션 데이터로부터 유저 상태 동기화
  syncUserFromSession: async (session) => {
    if (!session?.user) {
      get().clearUser();
      return;
    }

    const user = session.user;
    const meta = user.user_metadata || {};
    const fallbackName =
      meta.full_name ||
      meta.name ||
      meta.user_name ||
      meta.nickname ||
      meta.properties?.nickname ||
      meta.kakao_account?.profile?.nickname ||
      user.email?.split('@')[0] ||
      '간호사';
    const fallbackAvatar =
      meta.avatar_url ||
      meta.picture ||
      meta.properties?.profile_image ||
      meta.kakao_account?.profile?.profile_image_url ||
      undefined;

    // 먼저 세션 기본 정보로 즉시 로그인 상태 전환 (화면 지연 방지)
    set({
      id: user.id,
      email: user.email || null,
      name: fallbackName,
      nickname: fallbackName,
      avatarUrl: fallbackAvatar,
      isAuthenticated: true,
      isLoading: false,
    });

    // 백그라운드에서 DB 프로필 조회 및 동기화 (실패해도 로그인 유지)
    try {
      const profile = await profileApi.getMyProfile(user.id);
      if (profile) {
        const userRole: 'admin' | 'plus' | 'user' =
          profile.role === 'admin' ? 'admin' : profile.role === 'plus' ? 'plus' : 'user';
        set({
          name: profile.name || fallbackName,
          nickname: profile.nickname || fallbackName,
          hospitalName: profile.hospitalName || '종합병원',
          wardName: profile.wardName || '병동',
          experienceYears: profile.experienceYears ?? 1,
          avatarUrl: profile.avatarUrl || meta.avatar_url || meta.picture,
          role: userRole,
          isPremium: userRole === 'plus' || userRole === 'admin' || get().isPremium,
        });

        // 프로필에 사주 탄생 정보가 있으면 운세 스토어에도 자동 복원
        if (profile.birthDate) {
          useFortuneStore.getState().setBirthInfo({
            birthDate: profile.birthDate,
            birthTime: profile.birthTime || '미상',
            calendarType: profile.calendarType || 'solar',
            gender: profile.gender || 'female',
            isRegistered: true,
          });
        }
      }
    } catch (e) {
      console.warn('Profile fetch after login (using fallback):', e);
    }
  },

  clearUser: () =>
    set({
      id: null,
      email: null,
      name: '',
      nickname: '',
      hospitalName: '',
      wardName: '',
      experienceYears: 1,
      avatarUrl: undefined,
      isAuthenticated: false,
      isLoading: false,
      role: 'user',
      isPremium: false,
      monthlyFortuneCount: 0,
      appThemeColor: 'pink' as AppThemeColor,
    }),

  // 앱 시작 시 기존 세션 및 프로필 복원 (자동 로그인)
  initializeAuth: async () => {
    try {
      set({ isLoading: true });
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (session?.user) {
        await get().syncUserFromSession(session);
      } else {
        const currentId = get().id || '33072254-77c4-461a-a83f-8402b9df33c4';
        try {
          const profile = await profileApi.getMyProfile(currentId);
          if (profile) {
            set({
              id: currentId,
              name: profile.name || get().name,
              nickname: profile.nickname || get().nickname,
              role: profile.role || 'admin',
              isPremium: profile.role === 'admin' || profile.role === 'plus' || get().isPremium,
              isAuthenticated: true,
              isLoading: false,
            });
          } else {
            set({ isLoading: false });
          }
        } catch {
          set({ isLoading: false });
        }
      }
    } catch (e) {
      console.error('Error initializing auth:', e);
      set({ isLoading: false });
    }
  },

  // 프로필 수정 및 스토어 동기화
  updateUserProfile: async (updates) => {
    const { id } = get();
    if (!id) return false;
    try {
      await profileApi.updateProfile(id, updates);
      set((state) => ({
        ...state,
        name: updates.name ?? state.name,
        nickname: updates.nickname ?? state.nickname,
        hospitalName: updates.hospitalName ?? state.hospitalName,
        wardName: updates.wardName ?? state.wardName,
        experienceYears: updates.experienceYears ?? state.experienceYears,
        avatarUrl: updates.avatarUrl ?? state.avatarUrl,
      }));
      return true;
    } catch (e) {
      console.error('Error updating user profile:', e);
      return false;
    }
  },
}),
    {
      name: 'weganda-user-store',
      storage: createJSONStorage(() => ExpoSecureStoreAdapter),
      partialize: (state) => ({
        id: state.id,
        role: state.role,
        isPremium: state.isPremium,
        monthlyFortuneCount: state.monthlyFortuneCount,
        appThemeColor: state.appThemeColor,
        name: state.name,
        nickname: state.nickname,
        hospitalName: state.hospitalName,
        wardName: state.wardName,
        experienceYears: state.experienceYears,
        avatarUrl: state.avatarUrl,
      }),
    }
  )
);
