import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { COLORS } from '../../constants/theme';
import { useUserStore } from '../../store/useUserStore';
import { authService } from '../../services/auth';
import { AppleLogo, KakaoLogo, GoogleLogo } from '../../components/common/BrandIcons';
import { WegandaLogo } from '../../components/common/WegandaLogo';

interface LoginScreenProps {
  navigation: any;
}

export const LoginScreen: React.FC<LoginScreenProps> = () => {
  const [loadingProvider, setLoadingProvider] = useState<string | null>(null);
  const syncUserFromSession = useUserStore((state) => state.syncUserFromSession);
  const setUser = useUserStore((state) => state.setUser);

  // 🍏 Apple 로그인
  const handleAppleLogin = async () => {
    setLoadingProvider('apple');
    try {
      const result = await authService.signInWithApple();
      if (result?.session) {
        await syncUserFromSession(result.session);
      }
    } catch (error: any) {
      // 인증 취소는 조용히 무시
      if (!error.message?.includes('취소') && !error.message?.includes('canceled')) {
        Alert.alert('Apple 로그인', error.message || '로그인 중 오류가 발생했습니다.');
      }
    } finally {
      setLoadingProvider(null);
    }
  };

  // 🟡 카카오 로그인
  const handleKakaoLogin = async () => {
    setLoadingProvider('kakao');
    try {
      const result = await authService.signInWithKakao();
      if (result?.session) {
        await syncUserFromSession(result.session);
      }
    } catch (error: any) {
      if (!error.message?.includes('취소') && !error.message?.includes('dismissed')) {
        Alert.alert('카카오 로그인', error.message || '카카오 로그인 중 오류가 발생했습니다.');
      }
    } finally {
      setLoadingProvider(null);
    }
  };

  // 🌐 Google 로그인
  const handleGoogleLogin = async () => {
    setLoadingProvider('google');
    try {
      const result = await authService.signInWithGoogle();
      if (result?.session) {
        await syncUserFromSession(result.session);
      }
    } catch (error: any) {
      if (!error.message?.includes('취소') && !error.message?.includes('dismissed')) {
        Alert.alert('Google 로그인', error.message || 'Google 로그인 중 오류가 발생했습니다.');
      }
    } finally {
      setLoadingProvider(null);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* 상단 브랜딩 영역 */}
        <View style={styles.heroSection}>
          <WegandaLogo size={76} variant="full" style={{ marginBottom: 18 }} />
          <View style={styles.badge}>
            <Text style={styles.badgeText}>대한민국 50만 간호사를 위한</Text>
          </View>
          <Text style={styles.brandTitle}>우간다</Text>
          <Text style={styles.subtitle}>
            교대근무 캘린더부터 임상 운세,{'\n'}동기 톡과 익명 커뮤니티까지 한곳에서
          </Text>
        </View>

        {/* 하단 공식 규격 소셜 로그인 버튼 그룹 */}
        <View style={styles.buttonGroup}>
          {/* 🍏 Apple 로그인 */}
          <TouchableOpacity
            style={styles.appleButton}
            onPress={handleAppleLogin}
            disabled={loadingProvider !== null}
            activeOpacity={0.85}
          >
            {loadingProvider === 'apple' ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <View style={styles.buttonInner}>
                <AppleLogo size={19} color="#FFFFFF" />
                <Text style={styles.appleButtonText}>Apple로 계속하기</Text>
              </View>
            )}
          </TouchableOpacity>

          {/* 🟡 카카오 로그인 */}
          <TouchableOpacity
            style={styles.kakaoButton}
            onPress={handleKakaoLogin}
            disabled={loadingProvider !== null}
            activeOpacity={0.85}
          >
            {loadingProvider === 'kakao' ? (
              <ActivityIndicator color="#191919" />
            ) : (
              <View style={styles.buttonInner}>
                <KakaoLogo size={20} color="#181600" />
                <Text style={styles.kakaoButtonText}>카카오로 시작하기</Text>
              </View>
            )}
          </TouchableOpacity>

          {/* 🌐 구글 로그인 */}
          <TouchableOpacity
            style={styles.googleButton}
            onPress={handleGoogleLogin}
            disabled={loadingProvider !== null}
            activeOpacity={0.85}
          >
            {loadingProvider === 'google' ? (
              <ActivityIndicator color="#1F1F1F" />
            ) : (
              <View style={styles.buttonInner}>
                <GoogleLogo size={19} />
                <Text style={styles.googleButtonText}>Google로 시작하기</Text>
              </View>
            )}
          </TouchableOpacity>

          {/* 게스트 둘러보기 버튼 */}
          <TouchableOpacity
            style={styles.guestButton}
            onPress={() => {
              setUser({
                id: 'guest_user_preview',
                name: '간호사',
                nickname: '나이팅게일',
                hospitalName: '우간다 서울병원',
                wardName: '71병동',
                experienceYears: 3,
                isAuthenticated: true,
              });
            }}
            activeOpacity={0.7}
          >
            <Text style={styles.guestButtonText}>로그인 없이 앱 둘러보기 ›</Text>
          </TouchableOpacity>

          {/* 이용약관 안내 */}
          <Text style={styles.legalNotice}>
            계속 진행함으로써 우간다의{' '}
            <Text style={styles.legalLink}>서비스 이용약관</Text> 및{' '}
            <Text style={styles.legalLink}>개인정보 처리방침</Text>에 동의합니다.
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: 'space-between',
    paddingTop: 80,
    paddingBottom: 40,
  },
  heroSection: {
    alignItems: 'flex-start',
  },
  badge: {
    backgroundColor: '#FFF0F3',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginBottom: 16,
  },
  badgeText: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.primary,
  },
  brandTitle: {
    fontSize: 44,
    fontWeight: '900',
    color: '#191F28',
    letterSpacing: -1.5,
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 17,
    lineHeight: 26,
    color: '#4E5968',
    fontWeight: '500',
    letterSpacing: -0.3,
  },
  buttonGroup: {
    width: '100%',
    gap: 12,
  },
  buttonInner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  appleButton: {
    backgroundColor: '#000000',
    height: 54,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 2,
  },
  appleButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: -0.3,
  },
  kakaoButton: {
    backgroundColor: '#FEE500',
    height: 54,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  kakaoButtonText: {
    color: '#181600',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: -0.3,
  },
  googleButton: {
    backgroundColor: '#FFFFFF',
    height: 54,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E8EB',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  googleButtonText: {
    color: '#191F28',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: -0.3,
  },
  legalNotice: {
    fontSize: 12,
    lineHeight: 18,
    color: '#8B95A1',
    textAlign: 'center',
    marginTop: 8,
    paddingHorizontal: 16,
  },
  legalLink: {
    color: '#4E5968',
    textDecorationLine: 'underline',
  },
  guestButton: {
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  guestButtonText: {
    color: '#6B7280',
    fontSize: 14,
    fontWeight: '600',
  },
});
