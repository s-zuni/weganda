import { create } from 'zustand';
import { membershipEventApi } from '../services/membershipEventApi';
import {
  MembershipEventConfig,
  MembershipPlanKey,
  CurrentPlanPricing,
  FreeTrialEventConfig,
  DiscountEventConfig,
} from '../types/membershipEvent';
import {
  STANDARD_PRICING,
  EARLYBIRD_PRICING,
  IAP_SKUS,
  getDefaultEventDates,
} from '../constants/membership';

interface MembershipEventState {
  config: MembershipEventConfig;
  isLoading: boolean;
  isSaving: boolean;

  // 서버(관리자가 설정한 프로모션 값)에서 조회 — 앱 시작 시 1회 호출
  fetchConfig: () => Promise<void>;

  // Actions for Admin — 서버(membership_event_config 테이블, 관리자 전용 RLS)에 반영되며,
  // 실패(권한 없음/네트워크 오류) 시 로컬 상태를 이전 값으로 되돌리고 false를 반환한다.
  updateFreeTrialEvent: (patch: Partial<FreeTrialEventConfig>) => Promise<boolean>;
  updateMonthlyDiscountEvent: (patch: Partial<DiscountEventConfig>) => Promise<boolean>;
  updateYearlyDiscountEvent: (patch: Partial<DiscountEventConfig>) => Promise<boolean>;
  resetToDefaultEvents: () => Promise<boolean>;

  // Calculators & Helpers
  isFreeTrialActive: () => boolean;
  isMonthlyDiscountActive: () => boolean;
  isYearlyDiscountActive: () => boolean;
  getPlanPricing: (planType: MembershipPlanKey) => CurrentPlanPricing;
}

const isWithinDateRange = (startDate: string, endDate: string): boolean => {
  try {
    const today = new Date().toISOString().slice(0, 10);
    return today >= startDate && today <= endDate;
  } catch {
    return false;
  }
};

const createDefaultConfig = (): MembershipEventConfig => {
  const { startDate, end1m, end3m } = getDefaultEventDates();

  return {
    // 이벤트 1: 출시 후 3개월간 가입 고객 1개월 무료 체험
    freeTrialEvent: {
      isEnabled: true,
      durationMonths: 3,
      trialMonths: 1,
      startDate,
      endDate: end3m,
    },
    // 이벤트 2: 출시 후 1개월간 월간 5,900원 평생 할인 (정상가 7,900원)
    monthlyDiscountEvent: {
      isEnabled: true,
      durationMonths: 1,
      originalPrice: STANDARD_PRICING.monthly,
      discountedPrice: EARLYBIRD_PRICING.monthly,
      startDate,
      endDate: end1m,
    },
    // 이벤트 3: 출시 후 1개월간 연간 59,000원 평생 할인 (정상가 70,000원)
    yearlyDiscountEvent: {
      isEnabled: true,
      durationMonths: 1,
      originalPrice: STANDARD_PRICING.yearly,
      discountedPrice: EARLYBIRD_PRICING.yearly,
      startDate,
      endDate: end1m,
    },
  };
};

export const useMembershipEventStore = create<MembershipEventState>()(
  (set, get) => ({
      config: createDefaultConfig(),
      isLoading: false,
      isSaving: false,

      fetchConfig: async () => {
        set({ isLoading: true });
        try {
          const remote = await membershipEventApi.getConfig();
          if (remote) set({ config: remote });
        } catch (e) {
          console.warn('[useMembershipEventStore] fetchConfig failed:', e);
        } finally {
          set({ isLoading: false });
        }
      },

      // 낙관적으로 로컬을 먼저 갱신해 UI가 즉시 반응하게 하고, 서버 반영에 실패하면 이전 값으로 되돌린다.
      updateFreeTrialEvent: async (patch) => {
        const previous = get().config;
        const next = { ...previous, freeTrialEvent: { ...previous.freeTrialEvent, ...patch } };
        set({ config: next, isSaving: true });
        const ok = await membershipEventApi.updateConfig(next);
        set({ isSaving: false, config: ok ? next : previous });
        return ok;
      },

      updateMonthlyDiscountEvent: async (patch) => {
        const previous = get().config;
        const next = { ...previous, monthlyDiscountEvent: { ...previous.monthlyDiscountEvent, ...patch } };
        set({ config: next, isSaving: true });
        const ok = await membershipEventApi.updateConfig(next);
        set({ isSaving: false, config: ok ? next : previous });
        return ok;
      },

      updateYearlyDiscountEvent: async (patch) => {
        const previous = get().config;
        const next = { ...previous, yearlyDiscountEvent: { ...previous.yearlyDiscountEvent, ...patch } };
        set({ config: next, isSaving: true });
        const ok = await membershipEventApi.updateConfig(next);
        set({ isSaving: false, config: ok ? next : previous });
        return ok;
      },

      resetToDefaultEvents: async () => {
        const previous = get().config;
        const next = createDefaultConfig();
        set({ config: next, isSaving: true });
        const ok = await membershipEventApi.updateConfig(next);
        set({ isSaving: false, config: ok ? next : previous });
        return ok;
      },

      isFreeTrialActive: () => {
        const { freeTrialEvent } = get().config;
        return freeTrialEvent.isEnabled && isWithinDateRange(freeTrialEvent.startDate, freeTrialEvent.endDate);
      },

      isMonthlyDiscountActive: () => {
        const { monthlyDiscountEvent } = get().config;
        return monthlyDiscountEvent.isEnabled && isWithinDateRange(monthlyDiscountEvent.startDate, monthlyDiscountEvent.endDate);
      },

      isYearlyDiscountActive: () => {
        const { yearlyDiscountEvent } = get().config;
        return yearlyDiscountEvent.isEnabled && isWithinDateRange(yearlyDiscountEvent.startDate, yearlyDiscountEvent.endDate);
      },

      getPlanPricing: (planType: MembershipPlanKey): CurrentPlanPricing => {
        const { config, isFreeTrialActive, isMonthlyDiscountActive, isYearlyDiscountActive } = get();
        const hasTrial = isFreeTrialActive();

        if (planType === 'monthly') {
          const isDiscount = isMonthlyDiscountActive();
          const originalPrice = config.monthlyDiscountEvent.originalPrice;
          const currentPrice = isDiscount ? config.monthlyDiscountEvent.discountedPrice : originalPrice;
          const discountPercentage = Math.round(((originalPrice - currentPrice) / originalPrice) * 100);
          const sku = isDiscount ? IAP_SKUS.MONTHLY_EARLYBIRD : IAP_SKUS.MONTHLY_STANDARD;

          return {
            planType: 'monthly',
            originalPrice,
            currentPrice,
            isDiscountActive: isDiscount,
            isFreeTrialActive: hasTrial,
            discountPercentage,
            monthlyEquivalentPrice: currentPrice,
            sku,
          };
        } else {
          // Yearly
          const isDiscount = isYearlyDiscountActive();
          const originalPrice = config.yearlyDiscountEvent.originalPrice;
          const currentPrice = isDiscount ? config.yearlyDiscountEvent.discountedPrice : originalPrice;
          const discountPercentage = Math.round(((originalPrice - currentPrice) / originalPrice) * 100);
          const monthlyEquivalentPrice = Math.round(currentPrice / 12);
          const sku = isDiscount ? IAP_SKUS.YEARLY_EARLYBIRD : IAP_SKUS.YEARLY_STANDARD;

          return {
            planType: 'yearly',
            originalPrice,
            currentPrice,
            isDiscountActive: isDiscount,
            isFreeTrialActive: hasTrial,
            discountPercentage,
            monthlyEquivalentPrice,
            sku,
          };
        }
      },
    })
);
