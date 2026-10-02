import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, useAppTheme, type ThemeColors } from '../../constants/theme';
import { useUserStore } from '../../store/useUserStore';
import { consentApi } from '../../services/consentApi';
import {
  LoginConsentSection,
  LoginConsentState,
  isAllConsented,
} from '../../components/specific/Auth/LoginConsentSection';

interface ConsentScreenProps {
  navigation: any;
}

// 로그인(최초 가입) 직후 필수 약관 동의 화면 — 동의가 기록되어야만 온보딩/메인으로 진행된다.
export const ConsentScreen: React.FC<ConsentScreenProps> = ({ navigation }) => {
  const theme = useAppTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const [consent, setConsent] = useState<LoginConsentState>({ age: false, terms: false, privacy: false });
  const [submitting, setSubmitting] = useState(false);
  const setNeedsConsent = useUserStore((state) => state.setNeedsConsent);
  const clearUser = useUserStore((state) => state.clearUser);
  const consented = isAllConsented(consent);

  const handleAgree = async () => {
    setSubmitting(true);
    try {
      await consentApi.recordCurrentConsents();
      setNeedsConsent(false);
      if (!useUserStore.getState().hasCompletedOnboarding) {
        navigation.navigate('Onboarding');
      }
    } catch (e) {
      console.warn('[ConsentScreen] consent log failed:', e);
      Alert.alert('동의 처리 안내', '동의 내용을 저장하지 못했습니다. 네트워크 연결을 확인한 후 다시 시도해 주세요.');
    } finally {
      setSubmitting(false);
    }
  };

  // 동의하지 않으면 가입을 진행하지 않고 로그아웃한다.
  const handleDecline = async () => {
    await clearUser();
    navigation.navigate('Login');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View>
          <Text style={styles.title}>서비스 이용을 위해{'\n'}약관에 동의해 주세요</Text>
          <Text style={styles.subtitle}>최초 가입 시 한 번만 진행됩니다.</Text>
        </View>

        <View>
          <LoginConsentSection value={consent} onChange={setConsent} />
          <TouchableOpacity
            style={[styles.primaryButton, (!consented || submitting) && styles.disabled]}
            onPress={handleAgree}
            disabled={!consented || submitting}
            activeOpacity={0.85}
            accessibilityRole="button"
            accessibilityLabel="동의하고 계속하기"
          >
            {submitting ? (
              <ActivityIndicator color={theme.onPrimaryText} />
            ) : (
              <Text style={styles.primaryText}>동의하고 계속하기</Text>
            )}
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.declineButton}
            onPress={handleDecline}
            disabled={submitting}
            accessibilityRole="button"
            accessibilityLabel="동의하지 않고 로그인 화면으로 돌아가기"
          >
            <Text style={styles.declineText}>동의하지 않고 돌아가기</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

const createStyles = (theme: ThemeColors) => StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  content: { flex: 1, justifyContent: 'space-between', paddingHorizontal: 24, paddingTop: 48, paddingBottom: 24 },
  title: { fontSize: 26, fontWeight: '800', lineHeight: 36, color: COLORS.textPrimary, letterSpacing: -0.5 },
  subtitle: { marginTop: 10, fontSize: 14, color: COLORS.textSecondary },
  primaryButton: {
    height: 54,
    borderRadius: 27,
    backgroundColor: theme.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
  },
  primaryText: { color: theme.onPrimaryText, fontSize: 16, fontWeight: '700' },
  disabled: { opacity: 0.4 },
  declineButton: { minHeight: 44, justifyContent: 'center', alignItems: 'center', marginTop: 8 },
  declineText: { fontSize: 13, color: COLORS.textMuted, textDecorationLine: 'underline' },
});

export default ConsentScreen;
