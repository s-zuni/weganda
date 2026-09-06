import { create } from 'zustand';
import { fortuneApi } from '../services/fortuneApi';

export interface BirthInfo {
  birthDate: string; // YYYY-MM-DD
  birthTime: string; // HH:mm or '미상'
  calendarType: 'solar' | 'lunar';
  gender: 'female' | 'male';
  isRegistered: boolean;
}

export interface PartnerInfo {
  birthDate: string;
  birthTime: string;
  mbti: string;
}

export interface ColleagueInfo {
  name: string;
  birthDate: string;
  birthTime: string;
}

export type SubFortuneType = 'saju' | 'love' | 'career' | 'wealth';

interface FortuneState {
  birthInfo: BirthInfo;
  partnerInfo: PartnerInfo;
  colleagueInfo: ColleagueInfo;
  currentFortune?: any;
  isLoading: boolean;

  // 4대 세부 운세 확인(생성) 상태 — 추후 유료화 / 수익화 연계
  unlockedFortunes: Record<SubFortuneType, boolean>;
  isGeneratingFortune: Record<SubFortuneType, boolean>;

  // Actions
  setBirthInfo: (info: Partial<BirthInfo>) => void;
  setPartnerInfo: (info: Partial<PartnerInfo>) => void;
  setColleagueInfo: (info: Partial<ColleagueInfo>) => void;
  fetchAiFortune: (type?: 'daily' | 'saju' | 'love' | 'career' | 'wealth') => Promise<any>;
  unlockFortune: (type: SubFortuneType) => Promise<boolean>;
  resetFortune: (type: SubFortuneType) => void;
}

export const useFortuneStore = create<FortuneState>((set, get) => ({
  birthInfo: {
    birthDate: '',
    birthTime: '',
    calendarType: 'solar',
    gender: 'female',
    isRegistered: false,
  },
  partnerInfo: {
    birthDate: '',
    birthTime: '',
    mbti: '',
  },
  colleagueInfo: {
    name: '',
    birthDate: '',
    birthTime: '',
  },
  currentFortune: undefined,
  isLoading: false,

  unlockedFortunes: {
    saju: false,
    love: false,
    career: false,
    wealth: false,
  },
  isGeneratingFortune: {
    saju: false,
    love: false,
    career: false,
    wealth: false,
  },

  setBirthInfo: (info) =>
    set((state) => ({
      birthInfo: { ...state.birthInfo, ...info, isRegistered: true },
    })),

  setPartnerInfo: (info) =>
    set((state) => ({
      partnerInfo: { ...state.partnerInfo, ...info },
    })),

  setColleagueInfo: (info) =>
    set((state) => ({
      colleagueInfo: { ...state.colleagueInfo, ...info },
    })),

  // GPT 운세 & 바이오리듬 실시간 생성
  fetchAiFortune: async (type = 'daily') => {
    try {
      set({ isLoading: true });
      const { birthInfo, partnerInfo, colleagueInfo } = get();
      const result = await fortuneApi.generateFortune({
        fortuneType: type,
        birthInfo,
        partnerInfo,
        colleagueInfo,
      });

      set({ currentFortune: result, isLoading: false });
      return result;
    } catch (e: any) {
      console.warn('Notice in fetchAiFortune:', e?.message || e);
      set({ isLoading: false });
      return null;
    }
  },

  // 사용자가 '확인하기' 버튼을 눌렀을 때 비동기 API 호출 후 운세 생성 (추후 결제/광고 수익화 연동)
  unlockFortune: async (type: SubFortuneType) => {
    try {
      set((state) => ({
        isGeneratingFortune: { ...state.isGeneratingFortune, [type]: true },
      }));

      const { birthInfo, partnerInfo, colleagueInfo } = get();

      // 실제 API 호출 및 현실적인 AI 분석 대기 시간 (1.2초)
      const [result] = await Promise.all([
        fortuneApi.generateFortune({
          fortuneType: type,
          birthInfo,
          partnerInfo,
          colleagueInfo,
        }),
        new Promise((resolve) => setTimeout(resolve, 1200)),
      ]);

      set((state) => ({
        isGeneratingFortune: { ...state.isGeneratingFortune, [type]: false },
        unlockedFortunes: { ...state.unlockedFortunes, [type]: true },
      }));

      return true;
    } catch (e) {
      set((state) => ({
        isGeneratingFortune: { ...state.isGeneratingFortune, [type]: false },
      }));
      return false;
    }
  },

  resetFortune: (type: SubFortuneType) => {
    set((state) => ({
      unlockedFortunes: { ...state.unlockedFortunes, [type]: false },
    }));
  },
}));
