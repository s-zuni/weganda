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
import { COLORS } from '../../../constants/theme';
import { useUserStore } from '../../../store/useUserStore';
import { authService } from '../../../services/auth';
import { supabase } from '../../../services/supabase';

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

  const handleLogin = async () => {
    const trimmedId = username.trim();
    const trimmedPw = password.trim();

    if (!trimmedId || !trimmedPw) {
      Alert.alert('확인', '아이디와 비밀번호를 모두 입력해 주세요.');
      return;
    }

    // 심사용 지정 계정 검증
    const isValidReviewer =
      (trimmedId.toLowerCase() === 'testuser' || trimmedId.toLowerCase() === 'testuser@weganda.com') &&
      trimmedPw === 'weganda103820@';

    if (!isValidReviewer) {
      Alert.alert('로그인 실패', '심사관용 아이디 또는 비밀번호가 일치하지 않습니다.');
      return;
    }

    setIsLoading(true);
    try {
      // 1. Supabase Auth 연결 시도
      try {
        await supabase.auth.signInWithPassword({
          email: 'testuser@weganda.com',
          password: trimmedPw,
        });
      } catch (authErr) {
        console.log('Supabase reviewer fallback mode:', authErr);
      }

      // 2. 관리자(admin) 등급 및 모든 권한을 가진 풀 액세스 상태로 설정
      setUser({
        id: 'reviewer_admin_account',
        email: 'testuser@weganda.com',
        name: '앱스토어 심사관',
        nickname: '심사관(Admin)',
        hospitalName: '우간다 국립시뮬레이션병원',
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
    } catch (e: any) {
      Alert.alert('오류', e?.message || '심사 로그인 처리 중 오류가 발생했습니다.');
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
                    <Text style={styles.iconText}>🔐</Text>
                  </View>
                  <Text style={styles.title}>심사관 전용 로그인</Text>
                  <Text style={styles.subtitle}>
                    심사팀에 전달된 승인용 계정으로 로그인합니다.
                  </Text>
                </View>

                {/* ID 입력 */}
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>심사 아이디</Text>
                  <TextInput
                    style={styles.input}
                    value={username}
                    onChangeText={setUsername}
                    placeholder="아이디를 입력하세요"
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
                    placeholder="비밀번호를 입력하세요"
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
                    <Text style={styles.cancelBtnText}>닫기</Text>
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
                      <Text style={styles.submitBtnText}>관리자로 로그인</Text>
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
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
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
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  iconText: {
    fontSize: 22,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 17,
  },
  inputGroup: {
    marginBottom: 14,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 6,
  },
  input: {
    height: 46,
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingHorizontal: 14,
    fontSize: 15,
    color: '#111827',
  },
  quickFillChip: {
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    alignItems: 'center',
    marginBottom: 20,
  },
  quickFillText: {
    fontSize: 12,
    color: '#4B5563',
    fontWeight: '600',
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 10,
  },
  cancelBtn: {
    flex: 1,
    height: 46,
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
    height: 46,
    borderRadius: 12,
    backgroundColor: '#1E293B',
    justifyContent: 'center',
    alignItems: 'center',
  },
  submitBtnText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});

