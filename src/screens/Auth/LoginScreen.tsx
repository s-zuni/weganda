import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, NEUTRAL, TINT_COLORS } from '../../constants/theme';
import { useUserStore } from '../../store/useUserStore';
import { authService } from '../../services/auth';
import { authDebug, getAuthDebugLog } from '../../utils/authDebug';
import { AppleLogo, KakaoLogo, GoogleLogo } from '../../components/common/BrandIcons';
import { WegandaLogo } from '../../components/common/WegandaLogo';
import { SparklesIcon } from '../../components/common/Icon';
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
  const socialDisabled = loadingProvider !== null;
  const syncUserFromSession = useUserStore((state) => state.syncUserFromSession);
  const setUser = useUserStore((state) => state.setUser);

  // 로그인 직후 분기: 최초 가입(약관 미동의) → 동의 화면, 프로필 미완성 → 온보딩, 그 외 메인(RootNavigator가 전환)
  const goAfterLogin = () => {
    const state = useUserStore.getState();
    authDebug('login:goAfter', `auth=${state.isAuthenticated} onboarded=${state.hasCompletedOnboarding} needsConsent=${state.needsConsent}`);
    if (state.needsConsent) {
      navigation.navigate('Consent');
    } else if (!state.hasCompletedOnboarding) {
      navigation.navigate('Onboarding');
    }
  };

  // 🍏 Apple 로그인
  const handleAppleLogin = async () => {
    setLoadingProvider('apple');
    try {
      const result = await authService.signInWithApple();
      if (result?.session) {
        await syncUserFromSession(result.session);
        goAfterLogin();
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
        goAfterLogin();
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
        goAfterLogin();
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
      {/* 🔒 테스터 및 심사관 로그인 (우상단 희미한 test 버튼) */}
      <View style={styles.topBar}>
        <View style={{ flex: 1 }} />
        <TouchableOpacity
          style={[styles.reviewerButton, loadingProvider !== null && { opacity: 0.3 }]}
          onPress={() => setReviewerModalVisible(true)}
          disabled={loadingProvider !== null}
          activeOpacity={0.4}
          hitSlop={{ top: 16, bottom: 16, left: 16, right: 16 }}
          accessibilityRole="button"
          accessibilityLabel="테스터 로그인"
        >
          <Text style={styles.reviewerButtonText}>test</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        {/* 상단 브랜딩 영역 */}
        <View style={styles.heroSection}>
          <WegandaLogo size={76} variant="full" style={{ marginBottom: 18 }} />
          <View style={styles.badge}>
            <Text style={styles.badgeText}>대한민국 50만 간호사를 위한</Text>
          </View>
          {/* [임시 진단] 길게 누르면 최근 인증 로그 표시 */}
          <Text style={styles.brandTitle} onLongPress={() => Alert.alert('인증 로그', getAuthDebugLog())}>
            우간다
          </Text>
          <Text style={styles.subtitle}>
            교대근무 캘린더부터 임상 운세,{'\n'}동기 톡과 익명 커뮤니티까지 한곳에서
          </Text>

          {/* 1개월 무료 체험 혜택 프로모션 안내 배지 */}
          <View style={styles.promoBadge}>
            <SparklesIcon size={16} color={COLORS.primary} />
            <Text style={styles.promoText}>
              첫 소셜 로그인 시 <Text style={styles.promoBold}>weganda+ 1개월 무료체험</Text> 자동 제공
            </Text>
          </View>
        </View>

        {/* 하단 공식 규격 소셜 로그인 버튼 그룹 (애플/카카오/구글 전용) */}
        <View style={styles.buttonGroup}>
          {/* 🍏 Apple 로그인 */}
          <TouchableOpacity
            style={[styles.appleButton]}
            onPress={handleAppleLogin}
            disabled={socialDisabled}
            activeOpacity={0.85}
            accessibilityRole="button"
            accessibilityLabel="Apple로 계속하기"
          >
            {loadingProvider === 'apple' ? (
              <ActivityIndicator color={COLORS.onPrimaryText} />
            ) : (
              <View style={styles.buttonInner}>
                <AppleLogo size={19} color={COLORS.onPrimaryText} />
                <Text style={styles.appleButtonText}>Apple로 계속하기</Text>
              </View>
            )}
          </TouchableOpacity>

          {/* 🟡 카카오 로그인 */}
          <TouchableOpacity
            style={[styles.kakaoButton]}
            onPress={handleKakaoLogin}
            disabled={socialDisabled}
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
            style={[styles.googleButton]}
            onPress={handleGoogleLogin}
            disabled={socialDisabled}
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
    backgroundColor: COLORS.background,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: Platform.OS === 'android' ? 12 : 6,
    paddingBottom: 4,
    minHeight: 32,
    zIndex: 10,
  },
  reviewerButton: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 6,
  },
  reviewerButtonText: {
    fontSize: 13,
    color: '#9CA3AF',
    opacity: 0.45,
    fontWeight: '500',
    letterSpacing: 0.3,
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
    backgroundColor: TINT_COLORS.pinkTint,
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
    backgroundColor: TINT_COLORS.pinkTint,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: TINT_COLORS.pinkTintBorder,
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
    color: COLORS.onPrimaryText,
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
    backgroundColor: COLORS.background,
    height: 54,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
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
  consentPending: {
    opacity: 0.4,
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
