import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Modal,
  TouchableWithoutFeedback,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { COLORS, TINT_COLORS } from '../../../constants/theme';
import { useUserStore } from '../../../store/useUserStore';
import { authService } from '../../../services/auth';
import { LockIcon } from '../../common/Icon';

interface ReviewerLoginModalProps {
  visible: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const ReviewerLoginModal: React.FC<ReviewerLoginModalProps> = ({
  visible,
  onClose,
  onSuccess,
}) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const passwordRef = React.useRef<TextInput>(null);
  const setUser = useUserStore((state) => state.setUser);
  const syncUserFromSession = useUserStore((state) => state.syncUserFromSession);

  const handleLogin = async () => {
    const trimmedId = username.trim();
    const trimmedPw = password.trim();

    if (!trimmedId || !trimmedPw) {
      Alert.alert('확인', '아이디와 비밀번호를 모두 입력해 주세요.');
      return;
    }

    setIsLoading(true);
    try {
      // 출시 심사 및 로컬/스테이징 테스트용 지정 계정 확인
      const isTestUser =
        (trimmedId.toLowerCase() === 'testuser' || trimmedId.toLowerCase() === 'testuser@weganda.com') &&
        (trimmedPw === 'weganda2026@' || trimmedPw === 'weganda103820@');

      if (isTestUser) {
        // 1. Supabase 실제 계정 세션 동기화 시도 (존재 시)
        try {
          const authRes = await authService.signInWithPassword('testuser@weganda.com', trimmedPw);
          if (authRes?.session) {
            await syncUserFromSession(authRes.session);
          }
        } catch (authErr) {
          console.log('Supabase testuser login fallback mode:', authErr);
        }

        // 2. 심사관/테스터 풀 액세스 관리자 권한 보장
        setUser({
          id: 'reviewer_admin_account',
          email: 'testuser@weganda.com',
          name: '테스터(Admin)',
          nickname: '테스터',
          hospitalName: '우간다 국립병원',
          wardName: '중환자실 (ICU)',
          experienceYears: 5,
          role: 'admin',
          isPremium: true,
          isAuthenticated: true,
          isGuest: false,
          isVerified: true,
          verificationStatus: 'verified',
          verificationRole: 'nurse',
          hasCompletedOnboarding: true,
          subscriptionInfo: {
            planType: 'yearly',
            isEarlybird: true,
            price: 49000,
            isTrial: false,
            trialStartDate: '2026-01-01',
            trialEndDate: '2027-12-31',
            nextBillingDate: '2027-12-31',
            subscribedAt: new Date().toISOString(),
            status: 'active',
            storeSku: 'com.weganda.app.sub.yearly.earlybird',
          },
        });

        onClose();
        onSuccess?.();
        return;
      }

      // 3. 일반 이메일/비밀번호 Supabase 계정 로그인
      const emailToUse = trimmedId.includes('@') ? trimmedId : `${trimmedId}@weganda.com`;
      try {
        const authRes = await authService.signInWithPassword(emailToUse, trimmedPw);
        if (authRes?.session) {
          await syncUserFromSession(authRes.session);
          onClose();
          onSuccess?.();
          return;
        }
      } catch (authErr: any) {
        const msg = authErr?.message?.includes('Invalid login credentials')
          ? '아이디 또는 비밀번호가 일치하지 않습니다.'
          : (authErr?.message || '아이디 또는 비밀번호가 일치하지 않습니다.');
        Alert.alert('로그인 실패', msg);
        return;
      }

      Alert.alert('로그인 실패', '아이디 또는 비밀번호가 일치하지 않습니다.');
    } catch (e: any) {
      Alert.alert('오류', e?.message || '로그인 처리 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay}>
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.keyboardView}
          >
            <TouchableWithoutFeedback>
              <View style={styles.card}>
                {/* 헤더 */}
                <View style={styles.header}>
                  <View style={styles.iconCircle}>
                    <LockIcon size={22} color={COLORS.primary} />
                  </View>
                  <Text style={styles.title}>테스터 로그인</Text>
                  <Text style={styles.subtitle}>
                    출시 테스트용 계정 또는 등록된 이메일로 로그인합니다.
                  </Text>
                </View>

                {/* ID 입력 */}
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>아이디 / 이메일</Text>
                  <TextInput
                    style={styles.input}
                    value={username}
                    onChangeText={setUsername}
                    placeholder="testuser 또는 이메일"
                    placeholderTextColor="#9CA3AF"
                    keyboardType="email-address"
                    returnKeyType="next"
                    onSubmitEditing={() => passwordRef.current?.focus()}
                    autoCapitalize="none"
                    autoCorrect={false}
                  />
                </View>

                {/* PW 입력 */}
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>비밀번호</Text>
                  <TextInput
                    ref={passwordRef}
                    style={styles.input}
                    value={password}
                    onChangeText={setPassword}
                    placeholder="weganda2026@"
                    placeholderTextColor="#9CA3AF"
                    secureTextEntry
                    returnKeyType="done"
                    onSubmitEditing={handleLogin}
                    autoCapitalize="none"
                    autoCorrect={false}
                  />
                </View>

                {/* 액션 버튼 */}
                <View style={styles.buttonRow}>
                  <TouchableOpacity
                    style={styles.cancelBtn}
                    onPress={onClose}
                    disabled={isLoading}
                  >
                    <Text style={styles.cancelBtnText}>취소</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.submitBtn, isLoading && { opacity: 0.7 }]}
                    onPress={handleLogin}
                    disabled={isLoading}
                    activeOpacity={0.85}
                  >
                    {isLoading ? (
                      <ActivityIndicator color="#FFFFFF" size="small" />
                    ) : (
                      <Text style={styles.submitBtnText}>로그인</Text>
                    )}
                  </TouchableOpacity>
                </View>
              </View>
            </TouchableWithoutFeedback>
          </KeyboardAvoidingView>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  keyboardView: {
    width: '100%',
    maxWidth: 380,
  },
  card: {
    backgroundColor: COLORS.background,
    borderRadius: 20,
    padding: 24,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  header: {
    alignItems: 'center',
    marginBottom: 20,
  },
  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: TINT_COLORS.pinkTint,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 13,
    color: COLORS.textMuted,
    textAlign: 'center',
    lineHeight: 18,
  },
  inputGroup: {
    marginBottom: 14,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textSecondary,
    marginBottom: 6,
  },
  input: {
    height: 48,
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    paddingHorizontal: 14,
    fontSize: 15,
    color: COLORS.textPrimary,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 6,
  },
  cancelBtn: {
    flex: 1,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cancelBtnText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#4B5563',
  },
  submitBtn: {
    flex: 1.6,
    height: 48,
    borderRadius: 12,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  submitBtnText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});

