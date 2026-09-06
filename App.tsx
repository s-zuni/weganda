import React, { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import RootNavigator from './src/navigation/RootNavigator';
import { useUserStore } from './src/store/useUserStore';
import { supabase } from './src/services/supabase';
import { COLORS } from './src/constants/theme';

export default function App() {
  const initializeAuth = useUserStore((state) => state.initializeAuth);
  const syncUserFromSession = useUserStore((state) => state.syncUserFromSession);
  const clearUser = useUserStore((state) => state.clearUser);
  const isLoading = useUserStore((state) => state.isLoading);

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

    return () => {
      subscription.unsubscribe();
    };
  }, [initializeAuth, syncUserFromSession, clearUser]);

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
