import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Linking,
  Platform,
} from 'react-native';
import Constants from 'expo-constants';
import { COLORS } from '../../constants/theme';
import { useUserStore } from '../../store/useUserStore';
import { authService } from '../../services/auth';
import { AppleLogo, KakaoLogo, GoogleLogo } from '../../components/common/BrandIcons';
import { WegandaLogo } from '../../components/common/WegandaLogo';
import { ReviewerLoginModal } from '../../components/specific/Auth/ReviewerLoginModal';

interface LoginScreenProps {
  navigation: any;
}

const getFriendlyAuthErrorMessage = (error: any, provider: string): string => {
  const msg = error?.message || '';
  if (
    msg.includes('취소') ||
    msg.includes('canceled') ||
    msg.includes('dismissed') ||
    error?.code === 'ERR_REQUEST_CANCELED'
  ) {
    return '';
  }
  if (msg.includes('Network') || msg.includes('network') || msg.includes('timeout')) {
    return '네트워크 연결이 원활하지 않습니다. 인터넷 연결을 확인한 후 다시 시도해 주세요.';
  }
  if (msg.includes('rate limit') || msg.includes('too many')) {
    return '요청이 너무 많습니다. 잠시 후 다시 시도해 주세요.';
  }
  return `${provider} 로그인 중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.`;
};

export const LoginScreen: React.FC<LoginScreenProps> = ({ navigation }) => {
  const [loadingProvider, setLoadingProvider] = useState<string | null>(null);
  const [reviewerModalVisible, setReviewerModalVisible] = useState(false);
  const syncUserFromSession = useUserStore((state) => state.syncUserFromSession);
  const setUser = useUserStore((state) => state.setUser);

  // 🔒 심사관 전용 계정은 개발 환경(__DEV__) 또는 EAS 빌드 설정(reviewerLoginEnabled)에서만 노출
  const isReviewerLoginEnabled =
    __DEV__ || Boolean(Constants.expoConfig?.extra?.reviewerLoginEnabled);

  // 🍏 Apple 로그인
  const handleAppleLogin = async () => {
    setLoadingProvider('apple');
    try {
      const result = await authService.signInWithApple();
      if (result?.session) {
        await syncUserFromSession(result.session);
        const state = useUserStore.getState();
        if (!state.hasCompletedOnboarding) {
          navigation.navigate('Onboarding');
        }
      }
    } catch (error: any) {
      const friendly = getFriendlyAuthErrorMessage(error, 'Apple');
      if (friendly) {
        Alert.alert('로그인 안내', friendly);
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
        const state = useUserStore.getState();
        if (!state.hasCompletedOnboarding) {
          navigation.navigate('Onboarding');
        }
      }
    } catch (error: any) {
      const friendly = getFriendlyAuthErrorMessage(error, '카카오');
      if (friendly) {
        Alert.alert('로그인 안내', friendly);
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
        const state = useUserStore.getState();
        if (!state.hasCompletedOnboarding) {
          navigation.navigate('Onboarding');
        }
      }
    } catch (error: any) {
      const friendly = getFriendlyAuthErrorMessage(error, 'Google');
      if (friendly) {
        Alert.alert('로그인 안내', friendly);
      }
    } finally {
      setLoadingProvider(null);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* 🔒 앱스토어 / 구글플레이 심사관 전용 로그인 (프로덕션 빌드에서는 제외) */}
      {isReviewerLoginEnabled && (
        <View style={styles.topBar}>
          <View style={{ flex: 1 }} />
          <TouchableOpacity
            style={[styles.reviewerButton, loadingProvider !== null && { opacity: 0.4 }]}
            onPress={() => setReviewerModalVisible(true)}
            disabled={loadingProvider !== null}
            activeOpacity={0.5}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            accessibilityRole="button"
            accessibilityLabel="심사 전용 로그인"
          >
            <Text style={styles.reviewerButtonText}>심사 계정</Text>
          </TouchableOpacity>
        </View>
      )}

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

          {/* 🎁 1개월 무료 체험 혜택 프로모션 안내 배지 */}
          <View style={styles.promoBadge}>
            <Text style={styles.promoEmoji}>🎁</Text>
            <Text style={styles.promoText}>
              첫 소셜 로그인 시 <Text style={styles.promoBold}>weganda+ 1개월 무료체험</Text> 자동 제공
            </Text>
          </View>
        </View>

        {/* 하단 공식 규격 소셜 로그인 버튼 그룹 (애플/카카오/구글 전용) */}
        <View style={styles.buttonGroup}>
          {/* 🍏 Apple 로그인 */}
          <TouchableOpacity
            style={styles.appleButton}
            onPress={handleAppleLogin}
            disabled={loadingProvider !== null}
            activeOpacity={0.85}
            accessibilityRole="button"
            accessibilityLabel="Apple로 계속하기"
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
            accessibilityRole="button"
            accessibilityLabel="카카오로 시작하기"
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
            accessibilityRole="button"
            accessibilityLabel="Google로 시작하기"
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

          {/* 이용약관 안내 */}
          <Text style={styles.legalNotice}>
            계속 진행함으로써 우간다의{' '}
            <Text
              style={styles.legalLink}
              onPress={() => {
                const url = 'https://weganda.kr/terms';
                if (Platform.OS === 'web' && typeof window !== 'undefined') {
                  window.open(url, '_blank');
                } else {
                  Linking.openURL(url).catch((err) => console.warn(err));
                }
              }}
              accessibilityRole="link"
              accessibilityLabel="서비스 이용약관"
            >
              서비스 이용약관
            </Text>{' '}
            및{' '}
            <Text
              style={styles.legalLink}
              onPress={() => {
                const url = 'https://weganda.kr/privacy';
                if (Platform.OS === 'web' && typeof window !== 'undefined') {
                  window.open(url, '_blank');
                } else {
                  Linking.openURL(url).catch((err) => console.warn(err));
                }
              }}
              accessibilityRole="link"
              accessibilityLabel="개인정보 처리방침"
            >
              개인정보 처리방침
            </Text>
            에 동의합니다.
          </Text>
        </View>
      </View>

      {/* 🔐 심사관 전용 로그인 모달 */}
      <ReviewerLoginModal
        visible={reviewerModalVisible}
        onClose={() => setReviewerModalVisible(false)}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 4,
  },
  reviewerButton: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 8,
  },
  reviewerButtonText: {
    fontSize: 12,
    color: '#D1D5DB', // 심사관 전용으로 은은하고 희미하게 노출
    fontWeight: '500',
  },
  content: {
    flex: 1,
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 24,
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
    color: COLORS.textPrimary,
    letterSpacing: -1.5,
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 17,
    lineHeight: 26,
    color: COLORS.textSecondary,
    fontWeight: '500',
    letterSpacing: -0.3,
    marginBottom: 18,
  },
  promoBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF5F7',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#FFE4E9',
    gap: 8,
  },
  promoEmoji: {
    fontSize: 16,
  },
  promoText: {
    fontSize: 13,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  promoBold: {
    color: COLORS.primary,
    fontWeight: '700',
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
    color: COLORS.textPrimary,
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: -0.3,
  },
  legalNotice: {
    fontSize: 12,
    lineHeight: 18,
    color: COLORS.textMuted,
    textAlign: 'center',
    marginTop: 8,
    paddingHorizontal: 16,
  },
  legalLink: {
    color: COLORS.textSecondary,
    textDecorationLine: 'underline',
  },
});
