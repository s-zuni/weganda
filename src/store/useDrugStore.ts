import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { ExpoSecureStoreAdapter } from '../services/supabase';

export interface CustomDrugPreset {
  id: string;
  name: string;
  drugTotalMg: number;
  fluidTotalMl: number;
  defaultDose: number;
  unit: string;
  dropFactor: 20 | 60;
  description: string;
  isPinned: boolean;
  createdAt?: string;
}

/**
 * 사용자가 등록 폼에서 빠르게 참고할 수 있는 임상 추천 템플릿 (기본 목록에 자동 추가되지 않음)
 */
export const RECOMMENDED_DRUG_TEMPLATES: Omit<CustomDrugPreset, 'id'>[] = [
  {
    name: '도파민 (Dopamine)',
    drugTotalMg: 400,
    fluidTotalMl: 200,
    defaultDose: 5,
    unit: 'mcg/kg/min',
    dropFactor: 20,
    description: 'D5W 200mL 희석 기준 (승압 및 신혈류 유지)',
    isPinned: true,
  },
  {
    name: '노르에피네프린 (Norepi)',
    drugTotalMg: 8,
    fluidTotalMl: 50,
    defaultDose: 0.05,
    unit: 'mcg/kg/min',
    dropFactor: 20,
    description: 'D5W 50mL 희석 (중심정맥관 전용 투여 권장)',
    isPinned: true,
  },
  {
    name: '도부타민 (Dobutamine)',
    drugTotalMg: 250,
    fluidTotalMl: 250,
    defaultDose: 5,
    unit: 'mcg/kg/min',
    dropFactor: 20,
    description: 'D5W 250mL 믹스 (심근 수축력 강화제)',
    isPinned: false,
  },
  {
    name: '니트로글리세린 (NTG)',
    drugTotalMg: 50,
    fluidTotalMl: 250,
    defaultDose: 10,
    unit: 'mcg/min',
    dropFactor: 60,
    description: 'D5W 250mL 믹스 (차광 및 전용 세트 사용)',
    isPinned: false,
  },
  {
    name: '헤파린 (Heparin)',
    drugTotalMg: 200, // 20,000 unit
    fluidTotalMl: 500,
    defaultDose: 1000,
    unit: 'unit/hr',
    dropFactor: 60,
    description: '500mL 수액 믹스 (aPTT 모니터링 필수)',
    isPinned: false,
  },
];

interface DrugState {
  presets: CustomDrugPreset[];
  addPreset: (preset: Omit<CustomDrugPreset, 'id'>) => string;
  updatePreset: (id: string, preset: Partial<CustomDrugPreset>) => void;
  deletePreset: (id: string) => void;
  togglePinPreset: (id: string) => void;
  clearAllPresets: () => void;
}

export const useDrugStore = create<DrugState>()(
  persist(
    (set, get) => ({
      // 사용자가 직접 설정할 수 있도록 기본 세팅 계산기 없음 (빈 배열로 시작)
      presets: [],

      addPreset: (newPreset) => {
        const id = `drug_${Date.now()}`;
        const entry: CustomDrugPreset = {
          ...newPreset,
          id,
          createdAt: new Date().toISOString(),
        };
        set((state) => ({
          presets: [entry, ...state.presets],
        }));
        return id;
      },

      updatePreset: (id, updatedFields) => {
        set((state) => ({
          presets: state.presets.map((p) => (p.id === id ? { ...p, ...updatedFields } : p)),
        }));
      },

      deletePreset: (id) => {
        set((state) => ({
          presets: state.presets.filter((p) => p.id !== id),
        }));
      },

      togglePinPreset: (id) => {
        set((state) => ({
          presets: state.presets.map((p) =>
            p.id === id ? { ...p, isPinned: !p.isPinned } : p
          ),
        }));
      },

      clearAllPresets: () => {
        set({ presets: [] });
      },
    }),
    {
      name: 'weganda-custom-drug-presets',
      storage: createJSONStorage(() => ExpoSecureStoreAdapter),
    }
  )
);
