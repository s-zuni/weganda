import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { useUserStore } from '../../../store/useUserStore';

interface AdminLoginViewProps {
  onSuccess?: () => void;
  onGoHome?: () => void;
}

const ADMIN_PASSCODE = 'lsj103820@';

export const AdminLoginView: React.FC<AdminLoginViewProps> = ({
  onSuccess,
  onGoHome,
}) => {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const setUser = useUserStore((state) => state.setUser);

  const handleGrantAdminAccess = () => {
    setUser({
      id: 'admin-master',
      email: 'buiszuni@gmail.com',
      name: '스즈니 최고관리자',
      nickname: '최고관리자',
      role: 'admin',
      isAuthenticated: true,
      isPremium: true,
    });
    if (onSuccess) {
      onSuccess();
    }
  };

  const handleSubmit = () => {
    setError(null);
    const trimmed = password.trim();

    if (!trimmed) {
      setError('관리자 패스코드를 입력해주세요.');
      return;
    }

    setIsSubmitting(true);

    setTimeout(() => {
      if (trimmed === ADMIN_PASSCODE) {
        handleGrantAdminAccess();
      } else {
        setError('비밀번호가 일치하지 않습니다. 다시 확인해주세요.');
        setIsSubmitting(false);
      }
    }, 300);
  };

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        {/* 상단 뱃지 및 로고 */}
        <View style={styles.header}>
          <View style={styles.logoBadge}>
            <Text style={styles.logoIcon}>🩺</Text>
          </View>
          <Text style={styles.brandTitle}>WEGANDA ADMIN</Text>
          <Text style={styles.brandSubtitle}>우간다 서비스 통합 운영 콘솔</Text>
          <View style={styles.badgeRow}>
            <View style={styles.statusDot} />
            <Text style={styles.badgeText}>RESTRICTED ACCESS · AUTHORIZED ONLY</Text>
          </View>
        </View>

        {/* 폼 영역 */}
        <View style={styles.formSection}>
          <Text style={styles.inputLabel}>관리자 패스코드</Text>

          <View style={styles.inputWrapper}>
            <TextInput
              style={styles.input}
              placeholder="관리자 패스코드를 입력하세요"
              placeholderTextColor="#64748B"
              secureTextEntry={!showPassword}
              value={password}
              onChangeText={(text) => {
                setPassword(text);
                if (error) setError(null);
              }}
              onSubmitEditing={handleSubmit}
              autoCapitalize="none"
              autoCorrect={false}
              returnKeyType="done"
            />
            <TouchableOpacity
              style={styles.eyeBtn}
              onPress={() => setShowPassword(!showPassword)}
              activeOpacity={0.7}
            >
              <Text style={styles.eyeText}>{showPassword ? '숨김' : '보기'}</Text>
            </TouchableOpacity>
          </View>

          {error && <Text style={styles.errorText}>⚠️ {error}</Text>}

          {/* 로그인 버튼 */}
          <TouchableOpacity
            style={[styles.primaryBtn, isSubmitting && styles.btnDisabled]}
            onPress={handleSubmit}
            disabled={isSubmitting}
            activeOpacity={0.8}
          >
            {isSubmitting ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Text style={styles.primaryBtnText}>관리자 콘솔 로그인</Text>
            )}
          </TouchableOpacity>
        </View>

        {/* 하단 네비게이션 & 정보 */}
        <View style={styles.footer}>
          <TouchableOpacity
            style={styles.homeLink}
            onPress={() => {
              if (onGoHome) {
                onGoHome();
              } else if (Platform.OS === 'web' && typeof window !== 'undefined') {
                window.history.pushState({}, '', '/');
                window.dispatchEvent(new PopStateEvent('popstate'));
              }
            }}
            activeOpacity={0.7}
          >
            <Text style={styles.homeLinkText}>← 메인 홈페이지 (weganda.kr)로 이동</Text>
          </TouchableOpacity>

          <Text style={styles.footerInfo}>
            운영사: 스즈니(SZUNI) · 공식 문의: buiszuni@gmail.com
          </Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0B1120', // 깊은 다크 네이비
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  card: {
    width: '100%',
    maxWidth: 440,
    backgroundColor: '#1E293B', // Slate 800
    borderRadius: 24,
    padding: 32,
    borderWidth: 1,
    borderColor: '#334155',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.35,
    shadowRadius: 20,
    elevation: 10,
  },
  header: {
    alignItems: 'center',
    marginBottom: 28,
  },
  logoBadge: {
    width: 64,
    height: 64,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 80, 124, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 80, 124, 0.3)',
  },
  logoIcon: {
    fontSize: 32,
  },
  brandTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 1.5,
  },
  brandSubtitle: {
    fontSize: 13,
    color: '#94A3B8',
    marginTop: 4,
    fontWeight: '500',
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
    marginTop: 12,
    gap: 6,
    borderWidth: 1,
    borderColor: '#334155',
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#10B981',
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#CBD5E1',
    letterSpacing: 0.5,
  },
  formSection: {
    marginBottom: 24,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#E2E8F0',
    marginBottom: 8,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0F172A',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#334155',
    paddingHorizontal: 14,
    height: 50,
  },
  input: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: 15,
    paddingVertical: 0,
  },
  eyeBtn: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  eyeText: {
    color: '#94A3B8',
    fontSize: 12,
    fontWeight: '600',
  },
  errorText: {
    color: '#F87171',
    fontSize: 12,
    fontWeight: '600',
    marginTop: 8,
  },
  primaryBtn: {
    backgroundColor: '#FF507C', // 비바 코랄 핑크
    borderRadius: 14,
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 18,
    shadowColor: '#FF507C',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  primaryBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  btnDisabled: {
    opacity: 0.6,
  },
  footer: {
    alignItems: 'center',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#334155',
    gap: 12,
  },
  homeLink: {
    paddingVertical: 4,
  },
  homeLinkText: {
    color: '#94A3B8',
    fontSize: 13,
    fontWeight: '600',
  },
  footerInfo: {
    color: '#475569',
    fontSize: 11,
    textAlign: 'center',
  },
});
