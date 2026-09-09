import React, { useEffect, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { View, ActivityIndicator, StyleSheet, Platform } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import RootNavigator from './src/navigation/RootNavigator';
import { LandingScreen } from './src/screens/Landing/LandingScreen';
import { AdminScreen } from './src/screens/Admin/AdminScreen';
import { LegalScreen } from './src/screens/Legal/LegalScreen';
import { LegalTabKey } from './src/constants/legal/types';
import { useUserStore } from './src/store/useUserStore';
import { supabase } from './src/services/supabase';
import { COLORS } from './src/constants/theme';

export default function App() {
  const initializeAuth = useUserStore((state) => state.initializeAuth);
  const syncUserFromSession = useUserStore((state) => state.syncUserFromSession);
  const clearUser = useUserStore((state) => state.clearUser);
  const isLoading = useUserStore((state) => state.isLoading);

  // 웹 브라우저 접속 시 URL 라우팅 감지 (weganda.kr vs /admin vs /terms /privacy vs /app)
  const [currentWebRoute, setCurrentWebRoute] = useState<'landing' | 'admin' | 'app' | 'legal'>(() => {
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      const p = window.location.pathname;
      if (p.startsWith('/admin')) return 'admin';
      if (
        p.startsWith('/terms') ||
        p.startsWith('/privacy') ||
        p.startsWith('/paid-terms') ||
        p.startsWith('/refund') ||
        p.startsWith('/community-terms')
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
      if (tab && ['service', 'privacy', 'paid', 'community'].includes(tab)) return tab;
      if (p.startsWith('/privacy')) return 'privacy';
      if (p.startsWith('/paid-terms') || p.startsWith('/refund')) return 'paid';
      if (p.startsWith('/community-terms')) return 'community';
      return 'service';
    }
    return 'service';
  });

  useEffect(() => {
    // 1. 앱 기동 시 SecureStore에 저장된 세션 복원
    initializeAuth();

    // 2. Supabase 전역 인증 상태 변화 구독 (로그인, 로그아웃, 토큰 갱신 실시간 반영)
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        await syncUserFromSession(session);
      } else if (event === 'SIGNED_OUT') {
        clearUser();
      }
    });

    // 3. 웹 환경 브라우저 뒤로가기/앞으로가기 히스토리 이벤트 리스너
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      const handlePopState = () => {
        const p = window.location.pathname;
        if (p.startsWith('/admin')) {
          setCurrentWebRoute('admin');
        } else if (
          p.startsWith('/terms') ||
          p.startsWith('/privacy') ||
          p.startsWith('/paid-terms') ||
          p.startsWith('/refund') ||
          p.startsWith('/community-terms')
        ) {
          const search = new URLSearchParams(window.location.search);
          const tab = search.get('tab') as LegalTabKey;
          if (tab && ['service', 'privacy', 'paid', 'community'].includes(tab)) {
            setLegalInitialTab(tab);
          } else if (p.startsWith('/privacy')) {
            setLegalInitialTab('privacy');
          } else if (p.startsWith('/paid-terms') || p.startsWith('/refund')) {
            setLegalInitialTab('paid');
          } else if (p.startsWith('/community-terms')) {
            setLegalInitialTab('community');
          } else {
            setLegalInitialTab('service');
          }
          setCurrentWebRoute('legal');
        } else if (p.startsWith('/app') || window.location.search.includes('app=true')) {
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
          <AdminScreen
            onClose={() => {
              if (typeof window !== 'undefined') {
                window.history.pushState({}, '', '/');
              }
              setCurrentWebRoute('landing');
            }}
          />
        </SafeAreaProvider>
      );
    }

    if (currentWebRoute === 'legal') {
      return (
        <SafeAreaProvider>
          <StatusBar style="dark" />
          <LegalScreen
            initialTab={legalInitialTab}
            onNavigateHome={() => {
              if (typeof window !== 'undefined') {
                window.history.pushState({}, '', '/');
              }
              setCurrentWebRoute('landing');
            }}
          />
        </SafeAreaProvider>
      );
    }

    if (currentWebRoute === 'landing') {
      return (
        <SafeAreaProvider>
          <StatusBar style="dark" />
          <LandingScreen
            onNavigateAdmin={() => {
              if (typeof window !== 'undefined') {
                window.history.pushState({}, '', '/admin');
              }
              setCurrentWebRoute('admin');
            }}
            onNavigateLegal={(tab) => {
              if (typeof window !== 'undefined') {
                const targetUrl = tab ? `/terms?tab=${tab}` : '/terms';
                window.history.pushState({}, '', targetUrl);
              }
              if (tab) setLegalInitialTab(tab);
              setCurrentWebRoute('legal');
            }}
          />
        </SafeAreaProvider>
      );
    }
  }

  // ── 모바일 앱(iOS / Android) 환경 렌더링 ──
  return (
    <SafeAreaProvider>
      <StatusBar style="dark" />
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      ) : (
        <RootNavigator />
      )}
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
