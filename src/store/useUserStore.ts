import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { supabase, ExpoSecureStoreAdapter } from '../services/supabase';
import { profileApi, ProfileItem } from '../services/profileApi';
import { authService } from '../services/auth';
import { useFortuneStore } from './useFortuneStore';
import { UserSubscriptionInfo } from '../types/membershipEvent';

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
  userCode: string | null; // 7자리 고유번호
  isAuthenticated: boolean;
  isGuest: boolean;
  isLoading: boolean;

  // weganda+ 프리미엄 멤버십 & 유저 역할
  role: 'admin' | 'plus' | 'user' | 'nurse' | 'student';
  isPremium: boolean;
  monthlyFortuneCount: number;
  lastFortuneResetMonth: string;
  dailyAiCount: number;
  lastAiResetDate: string;
  dailyDrugCalcCount: number;
  lastDrugCalcResetDate: string;
  appThemeColor: AppThemeColor;
  subscriptionInfo: UserSubscriptionInfo | null;

  // 간호사 및 간호학생 인증 상태
  verificationStatus: 'none' | 'pending' | 'verified' | 'rejected';
  verificationRole: 'nurse' | 'student' | null;
  verificationRejectReason?: string;
  isVerified: boolean;
  // 온보딩 완료 상태
  hasCompletedOnboarding: boolean;
  schoolName?: string;
  schoolGrade?: number;
  onboardingDraft: { step: 1 | 2 | 3; profileData: any } | null;
  setOnboardingDraft: (draft: { step: 1 | 2 | 3; profileData: any } | null) => void;
  completeOnboarding: () => void;

  // Role & Premium Actions
  isAdmin: () => boolean;
  setUserRole: (role: 'admin' | 'plus' | 'user' | 'nurse' | 'student') => void;
  setVerificationState: (state: {
    verificationStatus: 'none' | 'pending' | 'verified' | 'rejected';
    verificationRole?: 'nurse' | 'student' | null;
    verificationRejectReason?: string;
    isVerified?: boolean;
  }) => void;
  subscribeToPremium: () => void;
  subscribeToPremiumWithDetails: (details: Partial<UserSubscriptionInfo>) => void;
  cancelSubscription: () => void;
  unsubscribePremium: () => void;
  incrementFortuneCount: () => void;
  incrementDailyAiCount: () => void;
  incrementDailyDrugCalcCount: () => void;
  setAppThemeColor: (color: AppThemeColor) => void;

  // Actions
  setUser: (user: Partial<UserState>) => void;
  syncUserFromSession: (session: any) => Promise<void>;
  clearUser: () => void;
  deleteAccount: () => Promise<boolean>;
  initializeAuth: () => Promise<void>;
  updateUserProfile: (
    updates: Partial<ProfileItem> & {
      hospital_name?: string;
      ward_name?: string;
      experience_years?: number;
    }
  ) => Promise<boolean>;
}

export const useUserStore = create<UserState>()(
  persist(
    (set, get) => ({
  id: null,
  email: null,
  name: '김간호',
  nickname: '김간호',
  hospitalName: '서울아산병원',
  wardName: '51병동 (소화기내과)',
  experienceYears: 3,
  avatarUrl: undefined,
  userCode: null,
  isAuthenticated: false,
  isGuest: false,
  isLoading: true,

  role: 'user',
  isPremium: false,
  monthlyFortuneCount: 0,
  lastFortuneResetMonth: new Date().toISOString().slice(0, 7),
  dailyAiCount: 0,
  lastAiResetDate: new Date().toISOString().slice(0, 10),
  dailyDrugCalcCount: 0,
  lastDrugCalcResetDate: new Date().toISOString().slice(0, 10),
  appThemeColor: 'pink' as AppThemeColor,
  subscriptionInfo: null,

  verificationStatus: 'none',
  verificationRole: null,
  verificationRejectReason: undefined,
  isVerified: false,
  hasCompletedOnboarding: false,
  schoolName: '',
  schoolGrade: 1,
  onboardingDraft: null,
  setOnboardingDraft: (draft) => set({ onboardingDraft: draft }),

  completeOnboarding: () => set({ hasCompletedOnboarding: true, isAuthenticated: true, onboardingDraft: null }),

  isAdmin: () => get().role === 'admin',
  setUserRole: (role) => set({ role, isPremium: role === 'plus' || role === 'admin' }),
  setVerificationState: (newState) =>
    set((state) => ({
      verificationStatus: newState.verificationStatus,
      verificationRole: newState.verificationRole !== undefined ? newState.verificationRole : state.verificationRole,
      verificationRejectReason: newState.verificationRejectReason,
      isVerified: newState.isVerified !== undefined ? newState.isVerified : newState.verificationStatus === 'verified',
    })),

  setUser: (user) => set((state) => ({ ...state, ...user })),

  // Mock 결제 성공 — 프리미엄 구독 활성화 (기본 얼리버드 1개월 무료체험 등록)
  subscribeToPremium: () => {
    const now = new Date();
    const trialEnd = new Date(now);
    trialEnd.setDate(trialEnd.getDate() + 30);
    const billingDate = trialEnd.toISOString().slice(0, 10);

    set({
      isPremium: true,
      subscriptionInfo: {
        planType: 'monthly',
        isEarlybird: true,
        price: 5900,
        isTrial: true,
        trialStartDate: now.toISOString().slice(0, 10),
        trialEndDate: billingDate,
        nextBillingDate: billingDate,
        subscribedAt: now.toISOString(),
        status: 'trial',
        storeSku: 'com.weganda.app.sub.monthly.earlybird',
      },
    });
  },

  // 플랜별 맞춤 구독 활성화
  subscribeToPremiumWithDetails: (details) => {
    const now = new Date();
    const trialEnd = new Date(now);
    trialEnd.setDate(trialEnd.getDate() + 30);
    const defaultBilling = trialEnd.toISOString().slice(0, 10);

    set({
      isPremium: true,
      subscriptionInfo: {
        planType: details.planType || 'monthly',
        isEarlybird: details.isEarlybird !== undefined ? details.isEarlybird : true,
        price: details.price || 5900,
        isTrial: details.isTrial !== undefined ? details.isTrial : true,
        trialStartDate: details.trialStartDate || now.toISOString().slice(0, 10),
        trialEndDate: details.trialEndDate || defaultBilling,
        nextBillingDate: details.nextBillingDate || defaultBilling,
        subscribedAt: details.subscribedAt || now.toISOString(),
        status: details.status || (details.isTrial ? 'trial' : 'active'),
        storeSku: details.storeSku || 'com.weganda.app.sub.monthly.earlybird',
      },
    });
  },

  // 구독 해지 예약 (만료일까지는 혜택 유지)
  cancelSubscription: () => {
    set((state) => ({
      subscriptionInfo: state.subscriptionInfo
        ? { ...state.subscriptionInfo, status: 'canceled' }
        : null,
    }));
  },

  // 즉시 프리미엄 해제
  unsubscribePremium: () =>
    set({
      isPremium: false,
      subscriptionInfo: null,
      appThemeColor: 'pink' as AppThemeColor,
    }),

  // 무료 운세 횟수 카운트 증가 (당월 자동 리셋 지원)
  incrementFortuneCount: () => {
    const currentMonth = new Date().toISOString().slice(0, 7);
    set((state) => {
      if (state.lastFortuneResetMonth !== currentMonth) {
        return {
          lastFortuneResetMonth: currentMonth,
          monthlyFortuneCount: 1,
        };
      }
      return { monthlyFortuneCount: state.monthlyFortuneCount + 1 };
    });
  },

  // 일일 AI 질문 횟수 카운트 증가 (당일 자동 리셋 지원)
  incrementDailyAiCount: () => {
    const today = new Date().toISOString().slice(0, 10);
    set((state) => {
      if (state.lastAiResetDate !== today) {
        return {
          lastAiResetDate: today,
          dailyAiCount: 1,
        };
      }
      return { dailyAiCount: state.dailyAiCount + 1 };
    });
  },

  // 일일 약물 계산 횟수 카운트 증가 (당일 자동 리셋 지원)
  incrementDailyDrugCalcCount: () => {
    const today = new Date().toISOString().slice(0, 10);
    set((state) => {
      if (state.lastDrugCalcResetDate !== today) {
        return {
          lastDrugCalcResetDate: today,
          dailyDrugCalcCount: 1,
        };
      }
      return { dailyDrugCalcCount: state.dailyDrugCalcCount + 1 };
    });
  },

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

    const current = get();

    // 먼저 세션 기본 정보로 즉시 로그인 상태 전환 (화면 지연 방지, 지속 저장된 프로필 우선 보존)
    set({
      id: user.id,
      email: user.email || null,
      name: current.name || fallbackName,
      nickname: current.nickname || fallbackName,
      avatarUrl: current.avatarUrl || fallbackAvatar,
      isAuthenticated: true,
      isGuest: false,
      isLoading: false,
    });

    // 백그라운드에서 DB 프로필 조회 및 동기화 (실패해도 로그인 유지)
    try {
      const profile = await profileApi.getMyProfile(user.id);
      if (profile) {
        const userRole: 'admin' | 'plus' | 'user' | 'nurse' | 'student' =
          profile.role === 'admin'
            ? 'admin'
            : profile.role === 'plus'
            ? 'plus'
            : profile.role === 'nurse'
            ? 'nurse'
            : profile.role === 'student'
            ? 'student'
            : 'user';
        set({
          name: profile.name || profile.nickname || current.name || fallbackName,
          nickname: profile.nickname || current.nickname || fallbackName,
          hospitalName: profile.hospitalName || current.hospitalName || '종합병원',
          wardName: profile.wardName || current.wardName || '병동',
          experienceYears: profile.experienceYears ?? current.experienceYears ?? 1,
          avatarUrl: profile.avatarUrl || current.avatarUrl || meta.avatar_url || meta.picture,
          role: userRole,
          isPremium: userRole === 'plus' || userRole === 'admin',
          userCode: profile.userCode || current.userCode || null,
          hasCompletedOnboarding: true,
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
      isGuest: false,
      isLoading: false,
      userCode: null,
      role: 'user',
      isPremium: false,
      monthlyFortuneCount: 0,
      dailyAiCount: 0,
      dailyDrugCalcCount: 0,
      appThemeColor: 'pink' as AppThemeColor,
      hasCompletedOnboarding: false,
      schoolName: '',
      schoolGrade: 1,
    }),

  // 회원 탈퇴 (Apple Guideline 5.1.1(v) 준수: 원격 계정 및 DB 데이터 영구 삭제 후 로컬 초기화)
  deleteAccount: async () => {
    try {
      set({ isLoading: true });
      await authService.deleteAccount();
      get().clearUser();
      return true;
    } catch (e) {
      console.error('Failed to delete user account:', e);
      set({ isLoading: false });
      return false;
    }
  },

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
        // 세션 없음 → 로그인 화면으로 이동 (isAuthenticated: false 유지)
        set({ isLoading: false });
      }
    } catch (e) {
      console.error('Error initializing auth:', e);
      set({ isLoading: false });
    }
  },

  // 프로필 수정 및 스토어 동기화
  updateUserProfile: async (updates) => {
    let { id } = get();
    if (!id) {
      const { data } = await supabase.auth.getUser();
      if (data?.user?.id) {
        id = data.user.id;
        set({ id });
      }
    }
    if (!id) return false;
    try {
      await profileApi.updateProfile(id, updates);
      set((state) => ({
        ...state,
        name: updates.name ?? updates.nickname ?? (updates as any).nickname ?? state.name,
        nickname: updates.nickname ?? updates.name ?? (updates as any).nickname ?? state.nickname,
        hospitalName: updates.hospitalName ?? (updates as any).hospital_name ?? state.hospitalName,
        wardName: updates.wardName ?? (updates as any).ward_name ?? state.wardName,
        experienceYears: updates.experienceYears ?? (updates as any).experience_years ?? state.experienceYears,
        avatarUrl: updates.avatarUrl ?? (updates as any).avatar_url ?? state.avatarUrl,
        ...(updates.role ? { role: updates.role as any } : {}),
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
        subscriptionInfo: state.subscriptionInfo,
        monthlyFortuneCount: state.monthlyFortuneCount,
        lastFortuneResetMonth: state.lastFortuneResetMonth,
        dailyAiCount: state.dailyAiCount,
        lastAiResetDate: state.lastAiResetDate,
        dailyDrugCalcCount: state.dailyDrugCalcCount,
        lastDrugCalcResetDate: state.lastDrugCalcResetDate,
        appThemeColor: state.appThemeColor,
        verificationStatus: state.verificationStatus,
        verificationRole: state.verificationRole,
        verificationRejectReason: state.verificationRejectReason,
        isVerified: state.isVerified,
        name: state.name,
        nickname: state.nickname,
        hospitalName: state.hospitalName,
        wardName: state.wardName,
        experienceYears: state.experienceYears,
        avatarUrl: state.avatarUrl,
        userCode: state.userCode,
        hasCompletedOnboarding: state.hasCompletedOnboarding,
        onboardingDraft: state.onboardingDraft,
        schoolName: state.schoolName,
        schoolGrade: state.schoolGrade,
      }),
    }
  )
);
