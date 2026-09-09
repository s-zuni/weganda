import { create } from 'zustand';

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
}

const DEFAULT_DRUG_PRESETS: CustomDrugPreset[] = [
  {
    id: 'drug_norepi',
    name: '노르에피네프린 (Norepi)',
    drugTotalMg: 8,
    fluidTotalMl: 50,
    defaultDose: 0.05,
    unit: 'mcg/kg/min',
    dropFactor: 20,
    description: '혈압 상승제 (중심정맥관 투여 권장, D5W 희석 원칙)',
    isPinned: true,
  },
  {
    id: 'drug_dopamine',
    name: '도파민 (Dopamine)',
    drugTotalMg: 400,
    fluidTotalMl: 200,
    defaultDose: 5,
    unit: 'mcg/kg/min',
    dropFactor: 20,
    description: '신혈류 증가 및 승압제 (용량별 수용체 차등 작용)',
    isPinned: true,
  },
  {
    id: 'drug_dobutamine',
    name: '도부타민 (Dobutamine)',
    drugTotalMg: 250,
    fluidTotalMl: 250,
    defaultDose: 5,
    unit: 'mcg/kg/min',
    dropFactor: 20,
    description: '심근 수축력 강화제 (급성 심부전, 심인성 쇼크)',
    isPinned: false,
  },
  {
    id: 'drug_ntg',
    name: '니트로글리세린 (NTG)',
    drugTotalMg: 50,
    fluidTotalMl: 250,
    defaultDose: 10,
    unit: 'mcg/min',
    dropFactor: 60,
    description: '관상동맥 확장 및 혈압 강하제 (차광 및 전용 튜브 사용)',
    isPinned: false,
  },
  {
    id: 'drug_heparin',
    name: '헤파린 (Heparin)',
    drugTotalMg: 200, // 20,000 unit
    fluidTotalMl: 500,
    defaultDose: 1000,
    unit: 'unit/hr',
    dropFactor: 60,
    description: '항응고제 프로토콜 (aPTT 4~6시간 간격 모니터링)',
    isPinned: false,
  },
];

interface DrugState {
  presets: CustomDrugPreset[];
  addPreset: (preset: Omit<CustomDrugPreset, 'id'>) => void;
  updatePreset: (id: string, preset: Partial<CustomDrugPreset>) => void;
  deletePreset: (id: string) => void;
  togglePinPreset: (id: string) => void;
}

export const useDrugStore = create<DrugState>((set) => ({
  presets: DEFAULT_DRUG_PRESETS,

  addPreset: (newPreset) => {
    const entry: CustomDrugPreset = {
      ...newPreset,
      id: `drug_${Date.now()}`,
    };
    set((state) => ({
      presets: [entry, ...state.presets],
    }));
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
}));

