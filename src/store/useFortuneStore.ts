import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { Alert } from 'react-native';
import { fortuneApi } from '../services/fortuneApi';
import { manseryeokService, SajuAnalysisResult } from '../services/manseryeokService';
import { sajuAnalysisGenerator, GeneratedSajuReport } from '../utils/sajuAnalysisGenerator';
import { sajuEngine } from '../services/sajuEngine';
import { SajuCategoryId, SajuTopicItem } from '../mocks/sajuCategories';
import { ExpoSecureStoreAdapter } from '../services/supabase';

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

export interface PartnerBirthData {
  name?: string;
  birthDate: string;
  birthTime: string;
  calendarType?: 'solar' | 'lunar';
  gender?: 'female' | 'male';
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

  // 만세력 정밀 사주 상태
  selectedCategoryId: SajuCategoryId;
  selectedTopic?: SajuTopicItem;
  currentManseryeokAnalysis?: SajuAnalysisResult;
  currentPartnerAnalysis?: SajuAnalysisResult;
  currentManseryeokReport?: GeneratedSajuReport;
  isAnalyzingManseryeok: boolean;

  // 4대 세부 운세 확인(생성) 상태
  unlockedFortunes: Record<SubFortuneType, boolean>;
  isGeneratingFortune: Record<SubFortuneType, boolean>;

  // Actions
  setBirthInfo: (info: Partial<BirthInfo>) => void;
  setPartnerInfo: (info: Partial<PartnerInfo>) => void;
  setColleagueInfo: (info: Partial<ColleagueInfo>) => void;
  setSelectedCategory: (categoryId: SajuCategoryId) => void;
  setSelectedTopic: (topic: SajuTopicItem) => void;
  runManseryeokAnalysis: (
    topic: SajuTopicItem,
    birthInfo: BirthInfo,
    partnerData?: PartnerBirthData
  ) => Promise<GeneratedSajuReport | null>;
  fetchAiFortune: (type?: 'daily' | 'saju' | 'love' | 'career' | 'wealth') => Promise<any>;
  unlockFortune: (type: SubFortuneType) => Promise<boolean>;
  resetFortune: (type: SubFortuneType) => void;
}

export const useFortuneStore = create<FortuneState>()(
  persist(
    (set, get) => ({
  birthInfo: {
    birthDate: '',
    birthTime: '미상',
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

  selectedCategoryId: 'nurse',
  selectedTopic: undefined,
  currentManseryeokAnalysis: undefined,
  currentManseryeokReport: undefined,
  isAnalyzingManseryeok: false,

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
      birthInfo: { ...state.birthInfo, ...info, isRegistered: Boolean(info.birthDate ?? state.birthInfo.birthDate) },
      ...(info.birthDate && info.birthDate !== state.birthInfo.birthDate ? { currentFortune: undefined } : {}),
    })),

  setPartnerInfo: (info) =>
    set((state) => ({
      partnerInfo: { ...state.partnerInfo, ...info },
    })),

  setColleagueInfo: (info) =>
    set((state) => ({
      colleagueInfo: { ...state.colleagueInfo, ...info },
    })),

  setSelectedCategory: (categoryId: SajuCategoryId) => set({ selectedCategoryId: categoryId }),

  setSelectedTopic: (topic: SajuTopicItem) => set({ selectedTopic: topic }),

  // 만세력 정밀 계산 및 50년 명인 1,000자+ 리포트 생성
  runManseryeokAnalysis: async (topic, birthInfo, partnerData) => {
    try {
      set({ isAnalyzingManseryeok: true });

      // 만세력 사주팔자·오행·신살·대운 정밀 계산
      const userSaju = manseryeokService.calculateSaju({
        birthDate: birthInfo.birthDate,
        birthTime: birthInfo.birthTime,
        calendarType: birthInfo.calendarType,
        gender: birthInfo.gender,
      });

      let partnerSaju: SajuAnalysisResult | undefined;
      if (partnerData && partnerData.birthDate) {
        partnerSaju = manseryeokService.calculateSaju({
          birthDate: partnerData.birthDate,
          birthTime: partnerData.birthTime || '12:00',
          calendarType: partnerData.calendarType || 'solar',
          gender: partnerData.gender || 'female',
        });
      }

      // 인위적 대기 시간 (정밀 감정 느낌을 주는 1초 딜레이)
      await new Promise((resolve) => setTimeout(resolve, 900));

      // SAJU_ANALYSIS_GUIDE.md 파이프라인 엔진을 거쳐 1,000자+ 심층 리포트 생성
      const report = await sajuEngine.analyzeSaju({
        topic,
        userSaju,
        partnerSaju,
        partnerName: partnerData?.name,
      });

      set({
        currentManseryeokAnalysis: userSaju,
        currentPartnerAnalysis: partnerSaju,
        currentManseryeokReport: report,
        selectedTopic: topic,
        isAnalyzingManseryeok: false,
      });

      return report;
    } catch (e: any) {
      console.error('Error in runManseryeokAnalysis:', e);
      set({ isAnalyzingManseryeok: false });
      Alert.alert('만세력 분석 오류', '사주팔자 계산 중 오류가 발생했습니다. 생년월일을 다시 확인해 주세요.');
      return null;
    }
  },

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
      Alert.alert(
        '운세 분석 안내',
        e?.message || 'AI 운세 생성 서버와 통신하지 못했습니다. 잠시 후 다시 시도해 주세요.'
      );
      return null;
    }
  },

  // 사용자가 '확인하기' 버튼을 눌렀을 때 비동기 API 호출 후 운세 생성
  unlockFortune: async (type: SubFortuneType) => {
    try {
      set((state) => ({
        isGeneratingFortune: { ...state.isGeneratingFortune, [type]: true },
      }));

      const { birthInfo, partnerInfo, colleagueInfo } = get();

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
    } catch (e: any) {
      set((state) => ({
        isGeneratingFortune: { ...state.isGeneratingFortune, [type]: false },
      }));
      Alert.alert(
        '운세 분석 오류',
        e?.message || '세부 운세를 불러오는 중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.'
      );
      return false;
    }
  },

  resetFortune: (type: SubFortuneType) => {
    set((state) => ({
      unlockedFortunes: { ...state.unlockedFortunes, [type]: false },
    }));
  },
}),
    {
      name: 'weganda-fortune-store',
      storage: createJSONStorage(() => ExpoSecureStoreAdapter),
      partialize: (state) => ({
        birthInfo: state.birthInfo,
        partnerInfo: state.partnerInfo,
        colleagueInfo: state.colleagueInfo,
        unlockedFortunes: state.unlockedFortunes,
        currentManseryeokReport: state.currentManseryeokReport,
      }),
    }
  )
);
