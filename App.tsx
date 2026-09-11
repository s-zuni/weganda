import React, { useEffect, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { Platform, AppState, AppStateStatus } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import RootNavigator from './src/navigation/RootNavigator';
import { LandingScreen } from './src/screens/Landing/LandingScreen';
import { AdminScreen } from './src/screens/Admin/AdminScreen';
import { LegalScreen } from './src/screens/Legal/LegalScreen';
import { LegalTabKey } from './src/constants/legal/types';
import { useUserStore } from './src/store/useUserStore';
import { supabase } from './src/services/supabase';
import ErrorBoundary from './src/components/common/ErrorBoundary';
import SplashScreenView from './src/components/common/SplashScreenView';
import { crashLogger } from './src/services/crashLogger';
import { inAppPurchaseService } from './src/services/inAppPurchaseService';

export default function App() {
  const initializeAuth = useUserStore((state) => state.initializeAuth);
  const syncUserFromSession = useUserStore((state) => state.syncUserFromSession);
  const clearUser = useUserStore((state) => state.clearUser);
  const isLoading = useUserStore((state) => state.isLoading);
  const isAuthenticated = useUserStore((state) => state.isAuthenticated);
  const role = useUserStore((state) => state.role);

  // 웹 브라우저 접속 시 URL 라우팅 감지 (weganda.kr vs /admin vs /terms /privacy /membership /community vs /app)
  const [currentWebRoute, setCurrentWebRoute] = useState<'landing' | 'admin' | 'app' | 'legal'>(() => {
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      const p = window.location.pathname;
      if (p.startsWith('/admin')) return 'admin';
      if (
        p.startsWith('/terms') ||
        p.startsWith('/privacy') ||
        p.startsWith('/membership') ||
        p.startsWith('/community') ||
        p.startsWith('/paid-terms') ||
        p.startsWith('/refund')
      ) {
        return 'legal';
      }
      if (p.startsWith('/app') || window.location.search.includes('app=true')) return 'app';
      return 'landing';
    }
    return 'landing';
  });

  const [legalInitialTab, setLegalInitialTab] = useState<LegalTabKey>(() => {
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      const p = window.location.pathname;
      const search = new URLSearchParams(window.location.search);
      const tab = search.get('tab') as LegalTabKey;
      if (tab && ['terms', 'privacy', 'membership', 'community'].includes(tab)) return tab;
      if (p.startsWith('/privacy')) return 'privacy';
      if (p.startsWith('/membership') || p.startsWith('/paid') || p.startsWith('/refund')) return 'membership';
      if (p.startsWith('/community')) return 'community';
      return 'terms';
    }
    return 'terms';
  });

  useEffect(() => {
    // 1. 앱 기동 시 SecureStore에 저장된 세션 복원
    initializeAuth();

    // 2. Supabase 전역 인증 상태 변화 구독 (로그인, 로그아웃, 토큰 갱신 실시간 반영)
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        crashLogger.setUserId(session.user.id);
        await syncUserFromSession(session);
      } else if (event === 'SIGNED_OUT') {
        crashLogger.setUserId(null);
        clearUser();
      }
    });

    // 3. 앱 포그라운드 복귀 시 토큰 갱신 및 세션 유효성 재확인 (1시간 초과 만료 방지)
    const appStateSub = AppState.addEventListener('change', (nextAppState: AppStateStatus) => {
      if (nextAppState === 'active') {
        supabase.auth.startAutoRefresh();
        initializeAuth();
      } else {
        supabase.auth.stopAutoRefresh();
      }
    });

    // 4. 웹 환경 브라우저 뒤로가기/앞으로가기 히스토리 이벤트 리스너
    let handlePopState: (() => void) | undefined;
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      handlePopState = () => {
        const p = window.location.pathname;
        if (p.startsWith('/admin')) {
          setCurrentWebRoute('admin');
        } else if (
          p.startsWith('/terms') ||
          p.startsWith('/privacy') ||
          p.startsWith('/membership') ||
          p.startsWith('/community') ||
          p.startsWith('/paid-terms') ||
          p.startsWith('/refund')
        ) {
          const search = new URLSearchParams(window.location.search);
          const tab = search.get('tab') as LegalTabKey;
          if (tab && ['terms', 'privacy', 'membership', 'community'].includes(tab)) {
            setLegalInitialTab(tab);
          } else if (p.startsWith('/privacy')) {
            setLegalInitialTab('privacy');
          } else if (p.startsWith('/membership') || p.startsWith('/paid') || p.startsWith('/refund')) {
            setLegalInitialTab('membership');
          } else if (p.startsWith('/community')) {
            setLegalInitialTab('community');
          } else {
            setLegalInitialTab('terms');
          }
          setCurrentWebRoute('legal');
        } else if (p.startsWith('/app') || window.location.search.includes('app=true')) {
          setCurrentWebRoute('app');
        } else {
          setCurrentWebRoute('landing');
        }
      };
      window.addEventListener('popstate', handlePopState);
    }

    return () => {
      subscription.unsubscribe();
      appStateSub.remove();
      if (handlePopState && typeof window !== 'undefined') {
        window.removeEventListener('popstate', handlePopState);
      }
    };
  }, [initializeAuth, syncUserFromSession, clearUser]);

  // 5. In-App Purchase (IAP) 생명주기 초기화 및 미완료 트랜잭션 리스너 등록 (스토어 필수 요건)
  useEffect(() => {
    inAppPurchaseService.init().then(() => {
      inAppPurchaseService.setupPurchaseListeners(
        (purchase) => {
          console.log('[IAP] In-app purchase transaction processed:', purchase?.productId);
        },
        (error) => {
          console.warn('[IAP] In-app purchase listener error:', error);
        }
      );
    });

    return () => {
      inAppPurchaseService.removePurchaseListeners();
    };
  }, []);

  // ── 웹(Browser) 환경 렌더링 ──
  if (Platform.OS === 'web') {
    if (isLoading) {
      return (
        <SafeAreaProvider>
          <StatusBar style="dark" />
          <SplashScreenView />
        </SafeAreaProvider>
      );
    }

    if (currentWebRoute === 'admin') {
      // 🔒 Authorization Guard: 관리자 권한(role === 'admin') 및 인증 여부 확인
      if (!isAuthenticated || role !== 'admin') {
        return (
          <SafeAreaProvider>
            <StatusBar style="dark" />
            <ErrorBoundary>
              <LandingScreen
                onNavigateAdmin={() => {
                  if (typeof window !== 'undefined') {
                    window.history.pushState({}, '', '/admin');
                  }
                  setCurrentWebRoute('admin');
                }}
              />
            </ErrorBoundary>
          </SafeAreaProvider>
        );
      }

      return (
        <SafeAreaProvider>
          <StatusBar style="dark" />
          <ErrorBoundary>
            <AdminScreen
              onClose={() => {
                if (typeof window !== 'undefined') {
                  window.history.pushState({}, '', '/');
                }
                setCurrentWebRoute('landing');
              }}
            />
          </ErrorBoundary>
        </SafeAreaProvider>
      );
    }

    if (currentWebRoute === 'legal') {
      return (
        <SafeAreaProvider>
          <StatusBar style="dark" />
          <ErrorBoundary>
            <LegalScreen
              initialTab={legalInitialTab}
              onNavigateHome={() => {
                if (typeof window !== 'undefined') {
                  window.history.pushState({}, '', '/');
                }
                setCurrentWebRoute('landing');
              }}
            />
          </ErrorBoundary>
        </SafeAreaProvider>
      );
    }

    if (currentWebRoute === 'landing') {
      return (
        <SafeAreaProvider>
          <StatusBar style="dark" />
          <ErrorBoundary>
            <LandingScreen
              onNavigateAdmin={() => {
                if (typeof window !== 'undefined') {
                  window.history.pushState({}, '', '/admin');
                }
                setCurrentWebRoute('admin');
              }}
              onNavigateLegal={(tab) => {
                if (typeof window !== 'undefined') {
                  const path = tab === 'terms' ? '/terms' : tab === 'privacy' ? '/privacy' : tab === 'membership' ? '/membership' : '/community';
                  window.history.pushState({}, '', path);
                }
                if (tab) setLegalInitialTab(tab);
                setCurrentWebRoute('legal');
              }}
            />
          </ErrorBoundary>
        </SafeAreaProvider>
      );
    }
  }

  // ── 모바일 앱(iOS / Android) 환경 렌더링 ──
  return (
    <SafeAreaProvider>
      <StatusBar style="dark" />
      <ErrorBoundary>
        {isLoading ? (
          <SplashScreenView />
        ) : (
          <RootNavigator />
        )}
      </ErrorBoundary>
    </SafeAreaProvider>
  );
}

