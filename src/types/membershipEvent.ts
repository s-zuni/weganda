export type MembershipPlanKey = 'monthly' | 'yearly';

export interface FreeTrialEventConfig {
  isEnabled: boolean;
  durationMonths: number; // 이벤트 진행 기간 (3개월)
  trialMonths: number;    // 무료 체험 기간 (1개월)
  startDate: string;      // YYYY-MM-DD
  endDate: string;        // YYYY-MM-DD
}

export interface DiscountEventConfig {
  isEnabled: boolean;
  durationMonths: number; // 이벤트 진행 기간 (1개월)
  originalPrice: number;  // 정상가
  discountedPrice: number;// 평생 할인가
  startDate: string;      // YYYY-MM-DD
  endDate: string;        // YYYY-MM-DD
}

export interface MembershipEventConfig {
  freeTrialEvent: FreeTrialEventConfig;
  monthlyDiscountEvent: DiscountEventConfig;
  yearlyDiscountEvent: DiscountEventConfig;
}

export interface UserSubscriptionInfo {
  planType: MembershipPlanKey;
  isEarlybird: boolean;
  price: number;
  isTrial: boolean;
  trialStartDate?: string;
  trialEndDate?: string;
  nextBillingDate: string;
  subscribedAt: string;
  status: 'active' | 'trial' | 'canceled';
  storeSku: string;
}

export interface CurrentPlanPricing {
  planType: MembershipPlanKey;
  originalPrice: number;
  currentPrice: number;
  isDiscountActive: boolean;
  isFreeTrialActive: boolean;
  discountPercentage: number;
  monthlyEquivalentPrice: number; // 연간 플랜의 월 환산 가격
  sku: string;
}
