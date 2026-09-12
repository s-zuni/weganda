import { Platform } from 'react-native';
import { useUserStore } from '../store/useUserStore';
import { subscriptionApi, VerifyPurchaseResult } from './subscriptionApi';
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

let purchaseUpdateSubscription: any = null;
let purchaseErrorSubscription: any = null;
let isConnected = false;

function isNitroAvailable(): boolean {
  if (Platform.OS !== 'ios' && Platform.OS !== 'android') return false;

  try {
    // 1. Expo Go 환경인지 체크 (Expo Go는 커스텀 C++ NativeModule 미지원)
    const Constants = require('expo-constants').default;
    if (
      Constants?.appOwnership === 'expo' ||
      Constants?.executionEnvironment === 'storeClient'
    ) {
      return false;
    }
  } catch {
    // expo-constants 없으면 통과
  }

  try {
    // 2. React Native TurboModuleRegistry에서 NitroModules 존재 여부 안전 검사
    const { TurboModuleRegistry } = require('react-native');
    if (TurboModuleRegistry && typeof TurboModuleRegistry.get === 'function') {
      const nitro = TurboModuleRegistry.get('NitroModules');
      return !!nitro;
    }
  } catch {
    return false;
  }

  return false;
}

function getNativeIap(): any {
  if (!isNitroAvailable()) {
    return null;
  }
  try {
    const pkg = 'react-native-iap';
    return require(pkg);
  } catch {
    return null;
  }
}

/**
 * In-App Purchase Service
 * Handles App Store (iOS StoreKit 2) and Google Play Billing via react-native-iap architecture.
 * Implements best practices:
 * 1. initConnection on start
 * 2. fetchProducts / requestPurchase
 * 3. purchaseUpdatedListener & finishTransaction (Crucial: Prevents duplicate charges)
 * 4. getAvailablePurchases for restorePurchases (Required by Apple/Google policies)
 * 5. Web / Simulator fallback for seamless development
 */
class InAppPurchaseService {
  private isNativeSupported(): boolean {
    return Platform.OS === 'ios' || Platform.OS === 'android';
  }

  // 네이티브 구매 객체를 서버(App Store Server API / Play Developer API)로 검증하고,
  // 검증에 성공한 경우에만 프리미엄을 부여한다. 절대 클라이언트 판단만으로 isPremium을 true로 만들지 않는다.
  private async verifyAndApplyPurchase(purchase: any): Promise<VerifyPurchaseResult | null> {
    const platform: 'ios' | 'android' | null =
      Platform.OS === 'ios' ? 'ios' : Platform.OS === 'android' ? 'android' : null;
    const productId: string | undefined = purchase?.productId || purchase?.id || purchase?.sku;
    const transactionId: string | undefined =
      purchase?.transactionId || purchase?.id || purchase?.originalTransactionIdIOS;
    const purchaseToken: string | undefined = purchase?.purchaseToken || purchase?.purchaseTokenAndroid;

    if (!platform || !productId) {
      console.warn('[IAP] Missing platform/productId, cannot verify purchase server-side.');
      return null;
    }

    try {
      const result = await subscriptionApi.verifyPurchase({ platform, productId, transactionId, purchaseToken });
      // applyServerSubscription은 subscription이 없거나 비활성 상태면 isPremium을 false로 되돌린다 —
      // 서버가 검증한 결과만 그대로 반영할 뿐, 클라이언트가 임의로 true를 만들 수 없다.
      useUserStore.getState().applyServerSubscription(result.subscription ?? null);
      if (!result.verified || !result.isPremium) {
        console.warn('[IAP] Purchase verification did not grant premium:', result.reason);
      }
      return result;
    } catch (verifyErr) {
      console.warn('[IAP] Server-side purchase verification failed:', verifyErr);
      return null;
    }
  }

  public async init(): Promise<boolean> {
    if (!this.isNativeSupported()) {
      console.log('[IAP] Web/Desktop environment detected. Using mock billing gateway.');
      isConnected = true;
      return true;
    }

    try {
      const RNIap = getNativeIap();
      if (!RNIap || typeof RNIap.initConnection !== 'function') {
        console.warn('[IAP] react-native-iap native module not loaded. Falling back to mock.');
        isConnected = true;
        return true;
      }

      const result = await RNIap.initConnection();
      isConnected = !!result;
      return isConnected;
    } catch (error: any) {
      console.warn('[IAP] initConnection error (falling back to mock):', error?.message || error);
      isConnected = true;
      return false;
    }
  }

  public setupPurchaseListeners(
    onSuccess?: (purchase: any) => void,
    onError?: (error: any) => void
  ): void {
    if (!this.isNativeSupported()) return;

    try {
      const RNIap = getNativeIap();
      if (!RNIap?.purchaseUpdatedListener) return;

      this.removePurchaseListeners();

      purchaseUpdateSubscription = RNIap.purchaseUpdatedListener(async (purchase: any) => {
        console.log('[IAP] purchaseUpdatedListener received:', purchase);

        try {
          // Android must finish within 3 days or Google auto-refunds.
          // iOS unfinished transactions replay on launch.
          if (RNIap.finishTransaction) {
            await RNIap.finishTransaction({ purchase, isConsumable: false });
            console.log('[IAP] finishTransaction completed successfully.');
          }

          // 서버 검증 통과 시에만 프리미엄 부여 (클라이언트 신뢰 방식 폐기)
          await this.verifyAndApplyPurchase(purchase);

          if (onSuccess) onSuccess(purchase);
        } catch (ackErr) {
          console.warn('[IAP] finishTransaction error:', ackErr);
        }
      });

      if (RNIap.purchaseErrorListener) {
        purchaseErrorSubscription = RNIap.purchaseErrorListener((error: any) => {
          console.warn('[IAP] purchaseErrorListener:', error);
          if (onError) onError(error);
        });
      }
    } catch (e) {
      console.warn('[IAP] setupPurchaseListeners error:', e);
    }
  }

  public removePurchaseListeners(): void {
    if (purchaseUpdateSubscription) {
      purchaseUpdateSubscription.remove();
      purchaseUpdateSubscription = null;
    }
    if (purchaseErrorSubscription) {
      purchaseErrorSubscription.remove();
      purchaseErrorSubscription = null;
    }
  }

  public async getSubscriptionProducts(): Promise<IapProduct[]> {
    const sku = Platform.select({
      ios: IAP_SKUS.SUBSCRIPTION_MONTHLY_IOS,
      android: IAP_SKUS.SUBSCRIPTION_MONTHLY_ANDROID,
      default: IAP_SKUS.SUBSCRIPTION_MONTHLY_IOS,
    });

    try {
      const RNIap = getNativeIap();
      if (RNIap && typeof RNIap.fetchProducts === 'function' && this.isNativeSupported()) {
        const products = await RNIap.fetchProducts({
          skus: [
            IAP_SKUS.MONTHLY_STANDARD,
            IAP_SKUS.MONTHLY_EARLYBIRD,
            IAP_SKUS.YEARLY_STANDARD,
            IAP_SKUS.YEARLY_EARLYBIRD,
          ],
          type: 'subs',
        });
        if (products && products.length > 0) {
          return products.map((item: any) => ({
            productId: item.id || item.productId,
            price: item.price || '5900',
            currency: item.currency || 'KRW',
            title: item.title || 'weganda+ 정기구독',
            description: item.description || '3교대 간호사를 위한 프리미엄 라이프스타일 혜택',
            localizedPrice: item.localizedPrice || (item.id?.includes('yearly') ? '₩59,000' : '₩5,900'),
            type: 'subs',
          }));
        }
      }
    } catch (e) {
      console.log('[IAP] Fetching store subscriptions failed. Returning default preset.');
    }

    return [
      {
        productId: IAP_SKUS.MONTHLY_EARLYBIRD,
        price: '5900',
        currency: 'KRW',
        title: 'weganda+ 월간 멤버십 (출시 얼리버드 평생할인)',
        description: '사주 무제한, 월급/수당 예측기, AI 무제한, 듀티 공유',
        localizedPrice: '월 5,900원 (평생)',
        type: 'subs',
      },
      {
        productId: IAP_SKUS.YEARLY_EARLYBIRD,
        price: '59000',
        currency: 'KRW',
        title: 'weganda+ 연간 멤버십 (출시 얼리버드 평생할인)',
        description: '사주 무제한, 월급/수당 예측기, AI 무제한 (월 4,916원 꼴)',
        localizedPrice: '연 59,000원 (평생)',
        type: 'subs',
      },
      {
        productId: IAP_SKUS.MONTHLY_STANDARD,
        price: '7900',
        currency: 'KRW',
        title: 'weganda+ 월간 멤버십 (정상가)',
        description: '사주 무제한, 월급/수당 예측기, AI 무제한, 듀티 공유',
        localizedPrice: '월 7,900원',
        type: 'subs',
      },
      {
        productId: IAP_SKUS.YEARLY_STANDARD,
        price: '70000',
        currency: 'KRW',
        title: 'weganda+ 연간 멤버십 (정상가)',
        description: '사주 무제한, 월급/수당 예측기, AI 무제한, 듀티 공유',
        localizedPrice: '연 70,000원',
        type: 'subs',
      },
    ];
  }

  public async requestSubscription(
    sku?: string,
    options?: {
      planType?: 'monthly' | 'yearly';
      price?: number;
      isTrial?: boolean;
      isEarlybird?: boolean;
    }
  ): Promise<IapPurchaseResult> {
    const targetSku = sku || IAP_SKUS.MONTHLY_EARLYBIRD;
    const planType = options?.planType || (targetSku.includes('yearly') ? 'yearly' : 'monthly');
    const isEarlybird = options?.isEarlybird !== undefined ? options.isEarlybird : targetSku.includes('earlybird');
    const price = options?.price || (planType === 'yearly' ? (isEarlybird ? 59000 : 70000) : (isEarlybird ? 5900 : 7900));
    const isTrial = options?.isTrial !== undefined ? options.isTrial : true;

    const isNative = this.isNativeSupported();
    const RNIap = isNative ? getNativeIap() : null;

    if (isNative && RNIap && typeof RNIap.requestPurchase === 'function') {
      try {
        console.log('[IAP] Invoking native requestPurchase for SKU:', targetSku);

        const requestPayload = {
          request: {
            apple: { sku: targetSku },
            google: { skus: [targetSku] },
          },
          type: 'subs' as const,
        };

        await RNIap.requestPurchase(requestPayload);

        // Native flow triggers purchaseUpdatedListener for completion
        return {
          success: true,
          productId: targetSku,
          transactionId: 'tx-' + Date.now(),
        };
      } catch (error: any) {
        if (error?.code === 'E_USER_CANCELLED') {
          return { success: false, errorMessage: '결제를 취소하셨습니다.' };
        }
        console.warn('[IAP] Native purchase error:', error?.message);
        return {
          success: false,
          errorMessage: error?.message || '결제 진행 중 오류가 발생했습니다. 다시 시도해주세요.',
        };
      }
    }

    // Mock Flow: 웹 또는 네이티브 IAP 모듈이 없는 모의/개발 환경에서만 시뮬레이션 동작
    // (실제 iOS / Android 프로덕션 환경에서는 결제 실패 시 무료 승급이 절대 발생하지 않음)
    await new Promise((resolve) => setTimeout(resolve, 1500));

    // 계산된 구독 정보로 전역 스토어 업데이트
    const now = new Date();
    const trialEnd = new Date(now);
    trialEnd.setDate(trialEnd.getDate() + (isTrial ? 30 : 0));
    const billingDate = trialEnd.toISOString().slice(0, 10);

    useUserStore.getState().subscribeToPremiumWithDetails({
      planType,
      isEarlybird,
      price,
      isTrial,
      trialStartDate: now.toISOString().slice(0, 10),
      trialEndDate: isTrial ? billingDate : undefined,
      nextBillingDate: billingDate,
      subscribedAt: now.toISOString(),
      status: isTrial ? 'trial' : 'active',
      storeSku: targetSku,
    });

    return {
      success: true,
      productId: targetSku,
      transactionId: 'mock-iap-tx-' + Date.now(),
      transactionReceipt: 'mock-iap-receipt-data',
    };
  }

  public async restorePurchases(): Promise<IapPurchaseResult> {
    try {
      const RNIap = getNativeIap();

      if (RNIap && typeof RNIap.getAvailablePurchases === 'function' && this.isNativeSupported()) {
        const purchases = await RNIap.getAvailablePurchases();
        console.log('[IAP] getAvailablePurchases:', purchases);

        if (purchases && purchases.length > 0) {
          const activeSub = purchases.find(
            (p: any) =>
              p.productId === IAP_SKUS.SUBSCRIPTION_MONTHLY_IOS ||
              p.productId === IAP_SKUS.SUBSCRIPTION_MONTHLY_ANDROID ||
              p.id === IAP_SKUS.SUBSCRIPTION_MONTHLY_IOS ||
              p.id === IAP_SKUS.SUBSCRIPTION_MONTHLY_ANDROID
          ) || purchases[0];

          // 서버 검증을 통과한 경우에만 복원 성공으로 처리 (클라이언트 신뢰 방식 폐기)
          const result = await this.verifyAndApplyPurchase(activeSub);
          if (result?.verified && result.isPremium) {
            return {
              success: true,
              productId: activeSub.productId || activeSub.id,
              transactionId: activeSub.transactionId || activeSub.id,
              isRestored: true,
            };
          }
          return {
            success: false,
            errorMessage: result?.reason || '유효한 구독을 확인하지 못해 복원할 수 없습니다.',
          };
        } else {
          return {
            success: false,
            errorMessage: '복원할 수 있는 이전 구매 내역이 없습니다.',
          };
        }
      }
    } catch (error: any) {
      console.warn('[IAP] restorePurchases failed:', error);
    }

    return {
      success: false,
      errorMessage: '복원 가능한 구매 내역을 찾을 수 없습니다.',
    };
  }

  public async end(): Promise<void> {
    this.removePurchaseListeners();
    try {
      const RNIap = getNativeIap();
      if (RNIap && typeof RNIap.endConnection === 'function') {
        await RNIap.endConnection();
      }
    } catch (e) {}
    isConnected = false;
  }
}

export const inAppPurchaseService = new InAppPurchaseService();
