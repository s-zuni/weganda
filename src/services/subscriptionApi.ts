import { supabase } from './supabase';
import { useUserStore } from '../store/useUserStore';

export interface VerifyPurchaseParams {
  platform: 'ios' | 'android';
  productId: string;
  transactionId?: string;
  purchaseToken?: string;
}

export interface VerifyPurchaseResult {
  verified: boolean;
  isPremium: boolean;
  subscription?: SubscriptionRow;
  reason?: string;
}

export interface SubscriptionRow {
  status: 'active' | 'trial' | 'grace_period' | 'expired' | 'revoked' | 'canceled';
  planType: 'monthly' | 'yearly';
  isEarlybird: boolean;
  price: number;
  isTrial: boolean;
  trialEndDate: string | null;
  expiresAt: string | null;
  subscribedAt: string | null;
  storeSku: string;
}

function extractFunctionErrorMessage(error: any, fallback: string): string {
  let message = error?.message || fallback;
  if (error?.context?.text) {
    try {
      const parsed = JSON.parse(error.context.text());
      if (parsed?.error) message = parsed.error;
    } catch (_) {}
  }
  return message;
}

export const subscriptionApi = {
  // 스토어 구매(iOS App Store Server API / Android Play Developer API)를 서버에서 실제로 검증하고
  // 검증 결과에 따라 subscriptions 테이블에 기록한다. 클라이언트는 이 결과만 신뢰해야 한다.
  async verifyPurchase(params: VerifyPurchaseParams): Promise<VerifyPurchaseResult> {
    const { data, error } = await supabase.functions.invoke('verify-purchase', {
      body: params,
    });

    if (error) {
      throw new Error(extractFunctionErrorMessage(error, '구매 검증 요청에 실패했습니다.'));
    }
    if (data?.error) {
      throw new Error(data.error);
    }

    return data as VerifyPurchaseResult;
  },

  // 서버(subscriptions 테이블)에 기록된 현재 구독 상태 조회 — 로그인/앱 시작 시 프리미엄 상태의 단일 진실 원천으로 사용.
  async getMySubscription(userId: string): Promise<SubscriptionRow | null> {
    if (userId === 'guest_user_preview' || useUserStore.getState().isGuest) {
      return null;
    }

    const { data, error } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    if (error) {
      console.warn('[subscriptionApi] getMySubscription failed:', error.message);
      return null;
    }
    if (!data) return null;

    return {
      status: data.status,
      planType: data.plan_type,
      isEarlybird: data.is_earlybird,
      price: data.price,
      isTrial: data.is_trial,
      trialEndDate: data.trial_end_date,
      expiresAt: data.expires_at,
      subscribedAt: data.purchased_at,
      storeSku: data.product_id,
    };
  },
};
