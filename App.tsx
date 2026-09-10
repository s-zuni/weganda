import React, { useEffect, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { Platform } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import RootNavigator from './src/navigation/RootNavigator';
import { LandingScreen } from './src/screens/Landing/LandingScreen';
import { AdminScreen } from './src/screens/Admin/AdminScreen';
import { useUserStore } from './src/store/useUserStore';
import { supabase } from './src/services/supabase';
import ErrorBoundary from './src/components/common/ErrorBoundary';
import SplashScreenView from './src/components/common/SplashScreenView';
import { crashLogger } from './src/services/crashLogger';

export default function App() {
  const initializeAuth = useUserStore((state) => state.initializeAuth);
  const syncUserFromSession = useUserStore((state) => state.syncUserFromSession);
  const clearUser = useUserStore((state) => state.clearUser);
  const isLoading = useUserStore((state) => state.isLoading);

  // 웹 브라우저 접속 시 URL 라우팅 감지 (weganda.kr vs weganda.kr/admin vs weganda.kr/app)
  const [currentWebRoute, setCurrentWebRoute] = useState<'landing' | 'admin' | 'app'>(() => {
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      if (window.location.pathname.startsWith('/admin')) return 'admin';
      if (window.location.pathname.startsWith('/app') || window.location.search.includes('app=true')) return 'app';
      return 'landing';
    }
    return 'landing';
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

    // 3. 웹 환경 브라우저 뒤로가기/앞으로가기 히스토리 이벤트 리스너
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      const handlePopState = () => {
        if (window.location.pathname.startsWith('/admin')) {
          setCurrentWebRoute('admin');
        } else if (window.location.pathname.startsWith('/app') || window.location.search.includes('app=true')) {
          setCurrentWebRoute('app');
        } else {
          setCurrentWebRoute('landing');
        }
      };
      window.addEventListener('popstate', handlePopState);
      return () => {
        subscription.unsubscribe();
        window.removeEventListener('popstate', handlePopState);
      };
    }

    return () => {
      subscription.unsubscribe();
    };
  }, [initializeAuth, syncUserFromSession, clearUser]);

  // ── 웹(Browser) 환경 렌더링 ──
  if (Platform.OS === 'web') {
    if (currentWebRoute === 'admin') {
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

