import { useUserStore } from '../store/useUserStore';
import { IAP_SKUS } from '../constants/membership';

export interface IapProduct {
  productId: string;
  price: string;
  currency: string;
  title: string;
  description: string;
  localizedPrice: string;
  type?: 'subs' | 'in-app';
}

export interface IapPurchaseResult {
  success: boolean;
  productId?: string;
  transactionId?: string;
  transactionReceipt?: string;
  isRestored?: boolean;
  errorMessage?: string;
}

/**
 * Web In-App Purchase Service
 * Mock / web fallback service for development and web preview.
 */
class WebInAppPurchaseService {
  public async init(): Promise<boolean> {
    console.log('[IAP Web] Web environment initialized.');
    return true;
  }

  public setupPurchaseListeners(
    _onSuccess?: (purchase: any) => void,
    _onError?: (error: any) => void
  ): void {
    // No-op on web
  }

  public removePurchaseListeners(): void {
    // No-op on web
  }

  public async getSubscriptionProducts(): Promise<IapProduct[]> {
    return [
      {
        productId: IAP_SKUS.SUBSCRIPTION_MONTHLY_IOS,
        price: '7800',
        currency: 'KRW',
        title: 'weganda+ (우간다 플러스) 월간 구독',
        description: '사주 무제한, 월급/수당 예측기, AI 무제한, 듀티 공유',
        localizedPrice: '월 7,800원',
        type: 'subs',
      },
    ];
  }

  public async requestSubscription(sku?: string): Promise<IapPurchaseResult> {
    const targetSku = sku || IAP_SKUS.SUBSCRIPTION_MONTHLY_IOS;
    // Simulate network delay (1.2s) and confirm subscription
    await new Promise((resolve) => setTimeout(resolve, 1200));
    useUserStore.getState().subscribeToPremium();

    return {
      success: true,
      productId: targetSku,
      transactionId: 'web-iap-tx-' + Date.now(),
      transactionReceipt: 'web-receipt',
    };
  }

  public async restorePurchases(): Promise<IapPurchaseResult> {
    const isAlreadyPremium = useUserStore.getState().isPremium;
    if (isAlreadyPremium) {
      return {
        success: true,
        productId: IAP_SKUS.SUBSCRIPTION_MONTHLY_IOS,
        isRestored: true,
      };
    }

    return {
      success: false,
      errorMessage: '복원 가능한 구매 내역을 찾을 수 없습니다.',
    };
  }

  public async end(): Promise<void> {
    // No-op on web
  }
}

export const inAppPurchaseService = new WebInAppPurchaseService();

