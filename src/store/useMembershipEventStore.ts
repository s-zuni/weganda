import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { ExpoSecureStoreAdapter } from '../services/supabase';
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

  // Actions for Admin
  updateFreeTrialEvent: (patch: Partial<FreeTrialEventConfig>) => void;
  updateMonthlyDiscountEvent: (patch: Partial<DiscountEventConfig>) => void;
  updateYearlyDiscountEvent: (patch: Partial<DiscountEventConfig>) => void;
  resetToDefaultEvents: () => void;

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
  persist(
    (set, get) => ({
      config: createDefaultConfig(),

      updateFreeTrialEvent: (patch) => {
        set((state) => ({
          config: {
            ...state.config,
            freeTrialEvent: { ...state.config.freeTrialEvent, ...patch },
          },
        }));
      },

      updateMonthlyDiscountEvent: (patch) => {
        set((state) => ({
          config: {
            ...state.config,
            monthlyDiscountEvent: { ...state.config.monthlyDiscountEvent, ...patch },
          },
        }));
      },

      updateYearlyDiscountEvent: (patch) => {
        set((state) => ({
          config: {
            ...state.config,
            yearlyDiscountEvent: { ...state.config.yearlyDiscountEvent, ...patch },
          },
        }));
      },

      resetToDefaultEvents: () => {
        set({ config: createDefaultConfig() });
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
    }),
    {
      name: 'weganda-membership-events',
      storage: createJSONStorage(() => ExpoSecureStoreAdapter),
    }
  )
);
