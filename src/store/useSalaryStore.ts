import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { ExpoSecureStoreAdapter } from '../services/supabase';

export interface SalaryState {
  baseSalary: number; // 월 기본급 (예: 2,800,000원)
  customNightAllowance: number | null; // 사용자 직접 입력 1회당 야간수당 (null이면 유추)
  customHolidayAllowance: number | null; // 사용자 직접 입력 1회당 휴일수당 (null이면 유추)

  // Actions
  setBaseSalary: (val: number) => void;
  setCustomNightAllowance: (val: number | null) => void;
  setCustomHolidayAllowance: (val: number | null) => void;

  // Calculators & Inferrers
  getInferredNightRate: (base?: number) => number;
  getInferredHolidayRate: (base?: number) => number;
}

export const useSalaryStore = create<SalaryState>()(
  persist(
    (set, get) => ({
      baseSalary: 2800000,
      customNightAllowance: null,
      customHolidayAllowance: null,

      setBaseSalary: (val) => set({ baseSalary: val }),
      setCustomNightAllowance: (val) => set({ customNightAllowance: val }),
      setCustomHolidayAllowance: (val) => set({ customHolidayAllowance: val }),

      // 통상임금(209시간) 기준 야간 가산(8시간*0.5) + 간호관리료 가산금 유추
      getInferredNightRate: (base?: number) => {
        const salary = base !== undefined ? base : get().baseSalary;
        if (!salary || salary <= 0) return 70000;
        const hourlyWage = salary / 209;
        const nightOvertimePay = hourlyWage * 8 * 0.5; // 야간근로 가산 (통상 50%)
        const nightCareBonus = 35000; // 병원 야간간호관리료 지원금 평균
        return Math.round((nightOvertimePay + nightCareBonus) / 1000) * 1000;
      },

      // 주말/휴일 근로 가산 수당 유추 (8시간 * 1.5배 중 휴일가산분 0.5배 기준)
      getInferredHolidayRate: (base?: number) => {
        const salary = base !== undefined ? base : get().baseSalary;
        if (!salary || salary <= 0) return 60000;
        const hourlyWage = salary / 209;
        const holidayBonus = hourlyWage * 8 * 0.5;
        return Math.round(holidayBonus / 1000) * 1000;
      },
    }),
    {
      name: 'weganda-salary-storage',
      storage: createJSONStorage(() => ExpoSecureStoreAdapter),
    }
  )
);
