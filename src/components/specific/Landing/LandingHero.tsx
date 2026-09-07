import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { COLORS } from '../../../constants/theme';
import { waitlistApi } from '../../../services/waitlistApi';
import { useResponsive } from '../../../utils/useResponsive';

export const LandingHero: React.FC = () => {
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
    <View style={[styles.heroSection, isMobile && styles.heroSectionMobile]} nativeID="hero">
      <View style={[styles.innerHero, isMobile && styles.innerHeroMobile]}>
        {/* Left Column: Copy & Email Form */}
        <View style={[styles.leftCol, isMobile && styles.leftColMobile]}>
          <Text style={[styles.mainTitle, isMobile && styles.mainTitleMobile]}>
            3교대 간호사의 고단한 하루,{'\n'}
            <Text style={styles.coralText}>우간다</Text>가 가볍게 만듭니다
          </Text>

          <Text style={[styles.subtitle, isMobile && styles.subtitleMobile]}>
            복잡한 3교대 근무표 정리, 동기들과의 오프 맞추기,{'\n'}
            투약 전 헷갈리는 약물 점적 계산까지.{'\n'}
            간호사만을 위한 올인원 서비스가 곧 찾아옵니다.
          </Text>

          {/* Email Capture Form */}
          <View style={styles.formContainer} nativeID="waitlist-input">
            <View style={[styles.inputWrapper, isMobile && styles.inputWrapperMobile]}>
              <TextInput
                style={[styles.emailInput, isMobile && styles.emailInputMobile]}
                placeholder="출시 소식을 받을 이메일 (예: nurse@hospital.kr)"
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

            {/* Submission Feedback Message */}
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

            {/* Benefit Highlights */}
            <View style={styles.benefitBox}>
              <Text style={styles.benefitItem}>
                🎁 <Text style={{ fontWeight: '700' }}>사전예약 혜택:</Text> 출시 시 정기구독 서비스(weganda+) 2개월 무료 제공
              </Text>
              <Text style={styles.benefitItem}>
                ✨ <Text style={{ fontWeight: '700' }}>안내:</Text> 기본 듀티 관리 서비스는 평생 무료로 이용하실 수 있습니다
              </Text>
            </View>
          </View>
        </View>

        {/* Right Column: Clean App Device Preview */}
        <View style={[styles.rightCol, isMobile && styles.rightColMobile]}>
          <View style={[styles.phoneOuter, isMobile && styles.phoneOuterMobile]}>
            <View style={styles.phoneSpeakerBar}>
              <View style={styles.speakerDot} />
              <View style={styles.cameraDot} />
            </View>

            <View style={styles.phoneScreen}>
              {/* App Header */}
              <View style={styles.mockHeader}>
                <Text style={styles.mockLogo}>우간다</Text>
                <View style={styles.mockIcons}>
                  <Text style={styles.mockIconText}>🔔</Text>
                  <Text style={styles.mockIconText}>👤</Text>
                </View>
              </View>

              {/* Greeting */}
              <View style={styles.mockGreeting}>
                <Text style={styles.mockGreetingText}>
                  <Text style={{ fontWeight: '800' }}>이수진</Text> 간호사님, 오늘{' '}
                  <Text style={{ color: COLORS.primary, fontWeight: '800' }}>데이(D)</Text> 근무도 힘내세요!
                </Text>
              </View>

              {/* Bento Shift Cards */}
              <View style={styles.mockBentoRow}>
                <View style={styles.mockTodayCard}>
                  <Text style={styles.mockCardLabel}>오늘 근무</Text>
                  <View style={styles.mockShiftBadgeCoral}>
                    <Text style={styles.mockShiftText}>D</Text>
                  </View>
                  <Text style={styles.mockShiftTime}>07:30 - 15:30</Text>
                </View>

                <View style={styles.mockTomorrowCard}>
                  <Text style={styles.mockCardLabel}>내일 근무</Text>
                  <View style={styles.mockShiftBadgeGreen}>
                    <Text style={styles.mockShiftText}>O</Text>
                  </View>
                  <Text style={styles.mockShiftTime}>내일은 오프! ☕</Text>
                </View>
              </View>

              {/* Weekly Strip */}
              <View style={styles.mockStripCard}>
                <Text style={styles.mockStripTitle}>이번 주 스케줄</Text>
                <View style={styles.mockStripRow}>
                  {[
                    { d: '월', c: 'D', a: true },
                    { d: '화', c: 'D' },
                    { d: '수', c: 'D' },
                    { d: '목', c: 'O' },
                    { d: '금', c: 'O' },
                    { d: '토', c: 'E' },
                    { d: '일', c: 'N' },
                  ].map((item, idx) => (
                    <View
                      key={idx}
                      style={[styles.mockDayItem, item.a && styles.mockDayItemActive]}
                    >
                      <Text style={[styles.mockDayName, item.a && { color: COLORS.primary }]}>
                        {item.d}
                      </Text>
                      <View
                        style={[
                          styles.mockCodeDot,
                          item.c === 'D' && { backgroundColor: '#FFE4E8' },
                          item.c === 'E' && { backgroundColor: '#FEF3C7' },
                          item.c === 'N' && { backgroundColor: '#EDE9FE' },
                          item.c === 'O' && { backgroundColor: '#DCFCE7' },
                        ]}
                      >
                        <Text
                          style={[
                            styles.mockCodeDotText,
                            item.c === 'D' && { color: COLORS.primary },
                            item.c === 'E' && { color: '#D97706' },
                            item.c === 'N' && { color: '#7C3AED' },
                            item.c === 'O' && { color: '#16A34A' },
                          ]}
                        >
                          {item.c}
                        </Text>
                      </View>
                    </View>
                  ))}
                </View>
              </View>

              {/* Quick Friend Match Alert */}
              <View style={styles.mockMatchCard}>
                <Text style={styles.mockMatchBadge}>🎉 오프 매칭</Text>
                <Text style={styles.mockMatchText}>
                  이번 주 목요일, 동기 2명과 함께 쉬는 날이에요!
                </Text>
              </View>
            </View>

            <View style={styles.phoneHomeBar}>
              <View style={styles.homeBar} />
            </View>
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  heroSection: {
    width: '100%',
    paddingVertical: 72,
    paddingHorizontal: 24,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
  },
  heroSectionMobile: {
    paddingVertical: 44,
    paddingHorizontal: 16,
  },
  innerHero: {
    maxWidth: 1160,
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 48,
  },
  innerHeroMobile: {
    flexDirection: 'column',
    gap: 40,
    alignItems: 'center',
  },
  leftCol: {
    flex: 1.1,
    maxWidth: 620,
    alignItems: 'flex-start',
  },
  leftColMobile: {
    maxWidth: '100%',
    alignItems: 'center',
    textAlign: 'center' as any,
  },
  mainTitle: {
    fontSize: 44,
    lineHeight: 56,
    fontWeight: '900',
    color: '#0F172A',
    marginBottom: 20,
    letterSpacing: -1,
  },
  mainTitleMobile: {
    fontSize: 28,
    lineHeight: 38,
    textAlign: 'center',
    marginBottom: 16,
  },
  coralText: {
    color: COLORS.primary,
  },
  subtitle: {
    fontSize: 17,
    lineHeight: 28,
    color: '#64748B',
    marginBottom: 36,
    letterSpacing: -0.2,
  },
  subtitleMobile: {
    fontSize: 14,
    lineHeight: 22,
    textAlign: 'center',
    marginBottom: 28,
  },
  formContainer: {
    width: '100%',
    maxWidth: 540,
  },
  inputWrapper: {
    flexDirection: 'row',
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    padding: 6,
    gap: 8,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 10,
    marginBottom: 14,
  },
  inputWrapperMobile: {
    flexDirection: 'column',
    padding: 8,
    gap: 8,
  },
  emailInput: {
    flex: 1,
    height: 48,
    paddingHorizontal: 16,
    fontSize: 15,
    color: '#0F172A',
    backgroundColor: 'transparent',
    borderWidth: 0,
    outlineWidth: 0,
  } as any,
  emailInputMobile: {
    height: 44,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
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
    marginBottom: 14,
  },
  successBox: {
    backgroundColor: '#DCFCE7',
    borderWidth: 1,
    borderColor: '#86EFAC',
  },
  errorBox: {
    backgroundColor: '#FEE2E2',
    borderWidth: 1,
    borderColor: '#FCA5A5',
  },
  messageText: {
    fontSize: 13,
    fontWeight: '600',
  },
  successText: {
    color: '#166534',
  },
  errorText: {
    color: '#991B1B',
  },
  benefitBox: {
    gap: 6,
    paddingTop: 4,
  },
  benefitItem: {
    fontSize: 13,
    color: '#64748B',
    lineHeight: 19,
  },
  rightCol: {
    flex: 0.9,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  rightColMobile: {
    marginTop: 8,
  },
  phoneOuter: {
    width: 320,
    height: 610,
    backgroundColor: '#1E293B',
    borderRadius: 44,
    padding: 10,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.16,
    shadowRadius: 32,
    borderWidth: 4,
    borderColor: '#0F172A',
  },
  phoneOuterMobile: {
    width: 290,
    height: 560,
    borderRadius: 36,
    padding: 8,
  },
  phoneSpeakerBar: {
    height: 18,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  speakerDot: {
    width: 44,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#334155',
  },
  cameraDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#334155',
  },
  phoneScreen: {
    flex: 1,
    backgroundColor: '#FAFAFA',
    borderRadius: 32,
    padding: 16,
    overflow: 'hidden',
  },
  phoneHomeBar: {
    height: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  homeBar: {
    width: 100,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#64748B',
  },
  mockHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
    paddingTop: 4,
  },
  mockLogo: {
    fontSize: 18,
    fontWeight: '900',
    color: '#0F172A',
  },
  mockIcons: {
    flexDirection: 'row',
    gap: 8,
  },
  mockIconText: {
    fontSize: 16,
  },
  mockGreeting: {
    backgroundColor: '#FFFFFF',
    padding: 12,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  mockGreetingText: {
    fontSize: 12,
    lineHeight: 18,
    color: '#334155',
  },
  mockBentoRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  mockTodayCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    padding: 12,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#FFE4E8',
    alignItems: 'center',
  },
  mockTomorrowCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
  },
  mockCardLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#64748B',
    marginBottom: 6,
  },
  mockShiftBadgeCoral: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
  },
  mockShiftBadgeGreen: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#22C55E',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
  },
  mockShiftText: {
    fontSize: 22,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  mockShiftTime: {
    fontSize: 10,
    fontWeight: '700',
    color: '#475569',
  },
  mockStripCard: {
    backgroundColor: '#FFFFFF',
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    marginBottom: 12,
  },
  mockStripTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: '#475569',
    marginBottom: 8,
  },
  mockStripRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  mockDayItem: {
    alignItems: 'center',
    padding: 2,
    borderRadius: 6,
  },
  mockDayItemActive: {
    backgroundColor: '#FFF0F3',
  },
  mockDayName: {
    fontSize: 10,
    fontWeight: '600',
    color: '#94A3B8',
    marginBottom: 2,
  },
  mockCodeDot: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  mockCodeDotText: {
    fontSize: 11,
    fontWeight: '800',
  },
  mockMatchCard: {
    backgroundColor: '#EFF6FF',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  mockMatchBadge: {
    fontSize: 10,
    fontWeight: '800',
    color: '#2563EB',
    marginBottom: 2,
  },
  mockMatchText: {
    fontSize: 11,
    color: '#1E3A8A',
    fontWeight: '600',
    lineHeight: 16,
  },
});
