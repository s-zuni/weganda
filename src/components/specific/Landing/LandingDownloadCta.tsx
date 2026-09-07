import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Image,
  Platform,
} from 'react-native';
import { COLORS } from '../../../constants/theme';
import { waitlistApi } from '../../../services/waitlistApi';
import { useResponsive } from '../../../utils/useResponsive';

export const LandingDownloadCta: React.FC = () => {
  const { isMobile } = useResponsive();
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async () => {
    if (!email.trim()) {
      setMessage('이메일 주소를 입력해주세요.');
      setIsSuccess(false);
      return;
    }

    setSubmitting(true);
    setMessage(null);

    const res = await waitlistApi.submitEmail(email);
    setSubmitting(false);
    setMessage(res.message);
    setIsSuccess(res.success);

    if (res.success) {
      setEmail('');
    }
  };

  return (
    <View style={[styles.container, isMobile && styles.containerMobile]} nativeID="waitlist-bottom">
      <View style={styles.inner}>
        <Image
          source={require('../../../assets/images/logo.png')}
          style={[styles.logoImage, isMobile && styles.logoImageMobile]}
          resizeMode="contain"
        />

        <Text style={[styles.title, isMobile && styles.titleMobile]}>
          우간다와 함께 변화할 간호사의 일상,{'\n'}
          가장 먼저 만나보세요
        </Text>

        <Text style={[styles.subtitle, isMobile && styles.subtitleMobile]}>
          지금 이메일을 등록하시면 앱 출시 당일 즉시 안내 메일을 발송해 드리며,{'\n'}
          <Text style={{ color: '#FFFFFF', fontWeight: '800' }}>
            weganda+ 프리미엄 멤버십 2개월 무료 이용 혜택
          </Text>
          을 제공합니다.
        </Text>

        {/* Email Capture Bar */}
        <View style={styles.formBox}>
          <View style={[styles.inputWrapper, isMobile && styles.inputWrapperMobile]}>
            <TextInput
              style={[styles.emailInput, isMobile && styles.emailInputMobile]}
              placeholder="이메일 주소를 입력해주세요..."
              placeholderTextColor="#94A3B8"
              value={email}
              onChangeText={(text) => {
                setEmail(text);
                if (message) setMessage(null);
              }}
              keyboardType="email-address"
              autoCapitalize="none"
              editable={!submitting}
            />
            <TouchableOpacity
              style={[styles.submitBtn, isMobile && styles.submitBtnMobile]}
              onPress={handleSubmit}
              disabled={submitting}
              activeOpacity={0.88}
            >
              {submitting ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Text style={styles.submitBtnText}>사전예약 신청</Text>
              )}
            </TouchableOpacity>
          </View>

          {/* Feedback */}
          {message && (
            <View
              style={[
                styles.messageBox,
                isSuccess ? styles.successBox : styles.errorBox,
              ]}
            >
              <Text
                style={[
                  styles.messageText,
                  isSuccess ? styles.successText : styles.errorText,
                ]}
              >
                {isSuccess ? '✓ ' : '⚠️ '}
                {message}
              </Text>
            </View>
          )}

          <Text style={styles.disclaimer}>
            ✨ 물론 기본 듀티 관리 서비스는 평생 무료로 제공됩니다.
          </Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    paddingVertical: 96,
    paddingHorizontal: 24,
    backgroundColor: '#090D16',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#1E293B',
  },
  containerMobile: {
    paddingVertical: 56,
    paddingHorizontal: 16,
  },
  inner: {
    maxWidth: 720,
    width: '100%',
    alignItems: 'center',
    textAlign: 'center' as any,
  },
  logoImage: {
    width: 60,
    height: 60,
    borderRadius: 16,
    marginBottom: 24,
  },
  logoImageMobile: {
    width: 48,
    height: 48,
    borderRadius: 12,
    marginBottom: 18,
  },
  title: {
    fontSize: 36,
    lineHeight: 48,
    fontWeight: '900',
    color: '#FFFFFF',
    marginBottom: 16,
    letterSpacing: -0.8,
    textAlign: 'center',
  },
  titleMobile: {
    fontSize: 24,
    lineHeight: 34,
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    lineHeight: 26,
    color: '#94A3B8',
    marginBottom: 32,
    textAlign: 'center',
    maxWidth: 580,
  },
  subtitleMobile: {
    fontSize: 14,
    lineHeight: 22,
    marginBottom: 24,
  },
  formBox: {
    width: '100%',
    maxWidth: 520,
    alignItems: 'center',
  },
  inputWrapper: {
    flexDirection: 'row',
    backgroundColor: '#1E293B',
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#334155',
    padding: 6,
    gap: 8,
    width: '100%',
    marginBottom: 14,
  },
  inputWrapperMobile: {
    flexDirection: 'column',
    padding: 8,
  },
  emailInput: {
    flex: 1,
    height: 48,
    paddingHorizontal: 16,
    fontSize: 15,
    color: '#FFFFFF',
    backgroundColor: 'transparent',
    borderWidth: 0,
    outlineWidth: 0,
  } as any,
  emailInputMobile: {
    height: 44,
    backgroundColor: '#0F172A',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#334155',
    fontSize: 14,
  },
  submitBtn: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 24,
    height: 48,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
  },
  submitBtnMobile: {
    height: 44,
    width: '100%',
  },
  submitBtnText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  messageBox: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 8,
    marginBottom: 12,
    width: '100%',
  },
  successBox: {
    backgroundColor: '#064E3B',
    borderWidth: 1,
    borderColor: '#059669',
  },
  errorBox: {
    backgroundColor: '#7F1D1D',
    borderWidth: 1,
    borderColor: '#DC2626',
  },
  messageText: {
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'center',
  },
  successText: {
    color: '#A7F3D0',
  },
  errorText: {
    color: '#FECACA',
  },
  disclaimer: {
    fontSize: 13,
    color: '#64748B',
    textAlign: 'center',
  },
});
