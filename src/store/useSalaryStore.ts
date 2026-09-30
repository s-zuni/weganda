import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { ExpoSecureStoreAdapter } from '../services/supabase';
import { salaryApi } from '../services/salaryApi';

export interface MonthlySalaryRecord {
  yearMonth: string; // "YYYY-MM" (예: "2026-09")
  totalSalary: number; // 전체 임금 (실수령/총지급액)
  baseAllowance: number; // 본수당 (기본급/본봉)
  nightAllowance: number; // 야간수당
  extraAllowance?: number; // 기타수당 (선택, 식대/직무/면허수당 등)
  holidayAllowance?: number; // 명절수당 / 휴일수당 (선택)
  memo?: string; // 메모 (선택)
  updatedAt: string; // ISO string
}

export interface NextMonthSalaryCalculation {
  targetYm: string; // "YYYY-MM"
  targetMonthLabel: string; // "10월"
  estimatedTotal: number;
  baseAllowance: number;
  nightAllowance: number;
  extraAllowance: number;
  holidayAllowance: number;
  nightCount: number;
  holidayWorkCount: number;
  effectiveNightRate: number;
  effectiveHolidayRate: number;
  basedOnMonth: string | null; // 기준이 된 기록 월
}

export interface SalaryState {
  baseSalary: number; // 월 기본급 (예: 2,800,000원)
  customNightAllowance: number | null; // 사용자 직접 입력 1회당 야간수당 (null이면 유추)
  customHolidayAllowance: number | null; // 사용자 직접 입력 1회당 휴일수당 (null이면 유추)

  // 월별 급여 기록 및 보안 가림 상태
  monthlyRecords: Record<string, MonthlySalaryRecord>; // key: "YYYY-MM"
  isAmountHidden: boolean; // 홈화면 실수령액 가림 여부 (기본 true: 민감정보 보안)

  // Actions
  setBaseSalary: (val: number) => void;
  setCustomNightAllowance: (val: number | null) => void;
  setCustomHolidayAllowance: (val: number | null) => void;
  toggleAmountHidden: () => void;
  setAmountHidden: (hidden: boolean) => void;
  saveMonthlyRecord: (record: MonthlySalaryRecord) => void;
  deleteMonthlyRecord: (yearMonth: string) => void;
  getMonthlyRecord: (yearMonth: string) => MonthlySalaryRecord | undefined;
  syncRecordsFromServer: () => Promise<void>; // 로그인 시 서버 기록 불러오기/병합
  resetSalaryData: () => void; // 로그아웃/탈퇴 시 개인 급여 정보 전체 초기화

  // Calculators & Inferrers
  getInferredNightRate: (base?: number) => number;
  getInferredHolidayRate: (base?: number) => number;
  calculateNextMonthSalary: (
    targetYm: string,
    schedules: Record<string, string>,
    customCodes?: Record<string, { code: string; isOff?: boolean; name?: string }>
  ) => NextMonthSalaryCalculation;
}

export const useSalaryStore = create<SalaryState>()(
  persist(
    (set, get) => ({
      baseSalary: 2800000,
      customNightAllowance: null,
      customHolidayAllowance: null,
      monthlyRecords: {},
      isAmountHidden: true, // 민감 개인정보이므로 홈화면 기본 가림 처리

      setBaseSalary: (val) => set({ baseSalary: val }),
      setCustomNightAllowance: (val) => set({ customNightAllowance: val }),
      setCustomHolidayAllowance: (val) => set({ customHolidayAllowance: val }),
      toggleAmountHidden: () => set((state) => ({ isAmountHidden: !state.isAmountHidden })),
      setAmountHidden: (hidden) => set({ isAmountHidden: hidden }),

      saveMonthlyRecord: (record) => {
        set((state) => {
          // 기본급 자동 반영은 가장 최근 월 기록을 저장할 때만 적용 (과거 월 수정이 현재 기본급을 덮어쓰지 않도록)
          const latestYm = Object.keys({ ...state.monthlyRecords, [record.yearMonth]: record })
            .sort()
            .pop();
          const isLatest = latestYm === record.yearMonth;
          return {
            monthlyRecords: {
              ...state.monthlyRecords,
              [record.yearMonth]: record,
            },
            baseSalary:
              isLatest && record.baseAllowance > 0 ? record.baseAllowance : state.baseSalary,
          };
        });
        // 서버 동기화는 백그라운드로 처리 (실패해도 로컬 저장은 유지, 다음 로그인 시 재동기화)
        salaryApi.upsertRecord(record).catch((e) => console.warn('[useSalaryStore] upsert failed:', e));
      },

      deleteMonthlyRecord: (yearMonth) => {
        set((state) => {
          const updated = { ...state.monthlyRecords };
          delete updated[yearMonth];
          return { monthlyRecords: updated };
        });
        salaryApi.deleteRecord(yearMonth).catch((e) => console.warn('[useSalaryStore] delete failed:', e));
      },

      // 로그인 시 서버 기록을 불러와 로컬과 병합 (updatedAt이 더 최신인 쪽 우선, 로컬에만 있거나 더 최신이면 서버로 푸시)
      syncRecordsFromServer: async () => {
        try {
          const remote = await salaryApi.getMyRecords();
          if (!remote) return; // 세션 없음(게스트)
          const local = get().monthlyRecords;
          const merged: Record<string, MonthlySalaryRecord> = { ...remote };
          const pushes: Promise<void>[] = [];
          Object.values(local).forEach((rec) => {
            const server = remote[rec.yearMonth];
            if (!server || new Date(rec.updatedAt).getTime() > new Date(server.updatedAt).getTime()) {
              merged[rec.yearMonth] = rec;
              pushes.push(salaryApi.upsertRecord(rec));
            }
          });
          set({ monthlyRecords: merged });
          await Promise.allSettled(pushes);
        } catch (e) {
          console.warn('[useSalaryStore] syncRecordsFromServer failed:', e);
        }
      },

      getMonthlyRecord: (yearMonth) => {
        return get().monthlyRecords[yearMonth];
      },

      resetSalaryData: () =>
        set({
          baseSalary: 2800000,
          customNightAllowance: null,
          customHolidayAllowance: null,
          monthlyRecords: {},
          isAmountHidden: true,
        }),

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

      // ── 다음 달 월급 계산 로직 (기록된 데이터 + 대상 월 스케줄 연동) ──
      calculateNextMonthSalary: (targetYm, schedules, customCodes = {}) => {
        const {
          baseSalary,
          customNightAllowance,
          customHolidayAllowance,
          monthlyRecords,
          getInferredNightRate,
          getInferredHolidayRate,
        } = get();

        // 1. 가장 최근 기록된 월급 레코드 탐색
        const recordedKeys = Object.keys(monthlyRecords).sort().reverse();
        const recentRecord = recordedKeys.length > 0 ? monthlyRecords[recordedKeys[0]] : null;
        const basedOnMonth = recentRecord ? recentRecord.yearMonth : null;

        // 2. 기본급(본수당) 결정
        const baseAllowance = recentRecord?.baseAllowance && recentRecord.baseAllowance > 0
          ? recentRecord.baseAllowance
          : (baseSalary > 0 ? baseSalary : 2800000);

        // 3. 야간 1회당 단가 도출
        let effectiveNightRate = customNightAllowance;
        if (!effectiveNightRate) {
          if (recentRecord && recentRecord.nightAllowance > 0 && basedOnMonth) {
            // 과거 기록 월의 나이트 횟수 카운트
            const pastNightCount = Object.entries(schedules).filter(([dateKey, code]) => {
              if (!dateKey.startsWith(basedOnMonth)) return false;
              if (code === 'N') return true;
              return customCodes[code]?.name?.includes('나이트');
            }).length;

            if (pastNightCount > 0) {
              effectiveNightRate = Math.round(recentRecord.nightAllowance / pastNightCount);
            }
          }
          if (!effectiveNightRate) {
            effectiveNightRate = getInferredNightRate(baseAllowance);
          }
        }

        // 4. 휴일 1회당 단가 도출
        let effectiveHolidayRate = customHolidayAllowance;
        if (!effectiveHolidayRate) {
          if (recentRecord && recentRecord.holidayAllowance && recentRecord.holidayAllowance > 0 && basedOnMonth) {
            const pastHolidayCount = Object.entries(schedules).filter(([dateKey, code]) => {
              if (!dateKey.startsWith(basedOnMonth)) return false;
              const d = new Date(dateKey);
              const isWeekend = d.getDay() === 0 || d.getDay() === 6;
              if (!isWeekend) return false;
              if (code === 'O' || code === 'V' || code === '/' || code === 'OFF' || customCodes[code]?.isOff) return false;
              return true;
            }).length;

            if (pastHolidayCount > 0) {
              effectiveHolidayRate = Math.round(recentRecord.holidayAllowance / pastHolidayCount);
            }
          }
          if (!effectiveHolidayRate) {
            effectiveHolidayRate = getInferredHolidayRate(baseAllowance);
          }
        }

        // 5. 기타수당 (식대, 면허수당 등 이전달 고정 수당 계승)
        const extraAllowance = recentRecord?.extraAllowance || 0;

        // 6. 대상 월(targetYm) 스케줄 집계
        const nightCount = Object.entries(schedules).filter(([dateKey, code]) => {
          if (!dateKey.startsWith(targetYm)) return false;
          if (code === 'N') return true;
          return customCodes[code]?.name?.includes('나이트');
        }).length;

        const holidayWorkCount = Object.entries(schedules).filter(([dateKey, code]) => {
          if (!dateKey.startsWith(targetYm)) return false;
          const d = new Date(dateKey);
          const isWeekend = d.getDay() === 0 || d.getDay() === 6;
          if (!isWeekend) return false;
          if (code === 'O' || code === 'V' || code === '/' || code === 'OFF' || customCodes[code]?.isOff) return false;
          return true;
        }).length;

        const totalNightPay = nightCount * effectiveNightRate;
        const totalHolidayPay = holidayWorkCount * effectiveHolidayRate;

        // 명절수당 (해당 월이 설날/추석 등 특수 명절달인 경우 또는 이전 기록 기반)
        const holidayAllowance = totalHolidayPay;

        const estimatedTotal = baseAllowance + totalNightPay + totalHolidayPay + extraAllowance;

        const parts = targetYm.split('-');
        const monthNum = parts[1] ? parseInt(parts[1], 10) : 1;
        const targetMonthLabel = `${monthNum}월`;

        return {
          targetYm,
          targetMonthLabel,
          estimatedTotal,
          baseAllowance,
          nightAllowance: totalNightPay,
          extraAllowance,
          holidayAllowance: totalHolidayPay,
          nightCount,
          holidayWorkCount,
          effectiveNightRate,
          effectiveHolidayRate,
          basedOnMonth,
        };
      },
    }),
    {
      name: 'weganda-salary-storage',
      storage: createJSONStorage(() => ExpoSecureStoreAdapter),
    }
  )
);
