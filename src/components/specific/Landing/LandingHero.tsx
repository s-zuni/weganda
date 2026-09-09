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

type ScreenKey = 'home' | 'friends' | 'study' | 'fortune' | 'community';

const SCREEN_META: { key: ScreenKey; label: string; icon: string; image: any }[] = [
  {
    key: 'home',
    label: '스마트 듀티',
    icon: '🏠',
    image: require('../../../assets/images/screens/home.png'),
  },
  {
    key: 'friends',
    label: '동기 듀티',
    icon: '👥',
    image: require('../../../assets/images/screens/friends.png'),
  },
  {
    key: 'study',
    label: '임상 학습',
    icon: '📚',
    image: require('../../../assets/images/screens/study.png'),
  },
  {
    key: 'fortune',
    label: '듀티 운세',
    icon: '🔮',
    image: require('../../../assets/images/screens/fortune.png'),
  },
  {
    key: 'community',
    label: '커뮤니티',
    icon: '💬',
    image: require('../../../assets/images/screens/community.png'),
  },
];

export const LandingHero: React.FC = () => {
  const { isMobile } = useResponsive();
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [activeScreen, setActiveScreen] = useState<ScreenKey>('home');

  const currentMeta = SCREEN_META.find((s) => s.key === activeScreen) || SCREEN_META[0];

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

        {/* Right Column: Interactive Real App UI Showcase */}
        <View style={[styles.rightCol, isMobile && styles.rightColMobile]}>
          {/* Quick Screen Switcher Tabs */}
          <View style={styles.switcherBar}>
            {SCREEN_META.map((tab) => {
              const isActive = tab.key === activeScreen;
              return (
                <TouchableOpacity
                  key={tab.key}
                  style={[styles.switcherTab, isActive && styles.switcherTabActive]}
                  onPress={() => setActiveScreen(tab.key)}
                  activeOpacity={0.8}
                >
                  <Text style={styles.switcherIcon}>{tab.icon}</Text>
                  <Text style={[styles.switcherLabel, isActive && styles.switcherLabelActive]}>
                    {tab.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Phone Outer Frame with REAL UI Image */}
          <View style={[styles.phoneOuter, isMobile && styles.phoneOuterMobile]}>
            <View style={styles.phoneSpeakerBar}>
              <View style={styles.speakerDot} />
              <View style={styles.cameraDot} />
            </View>

            <View style={styles.phoneScreen}>
              <Image
                source={currentMeta.image}
                style={styles.realAppImage}
                resizeMode="cover"
              />
            </View>

            <View style={styles.phoneHomeBar}>
              <View style={styles.homeBar} />
            </View>
          </View>

          <Text style={styles.previewCaption}>
            👆 탭을 눌러 우간다의 실제 앱 화면을 미리 확인하세요
          </Text>
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
    maxWidth: 600,
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
  switcherBar: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 6,
    marginBottom: 16,
    width: '100%',
    maxWidth: 340,
  },
  switcherTab: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 9999,
  },
  switcherTabActive: {
    backgroundColor: COLORS.primary,
  },
  switcherIcon: {
    fontSize: 12,
  },
  switcherLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#475569',
  },
  switcherLabelActive: {
    color: '#FFFFFF',
  },
  phoneOuter: {
    width: 310,
    height: 640,
    backgroundColor: '#0F172A',
    borderRadius: 44,
    padding: 8,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.2,
    shadowRadius: 36,
    borderWidth: 4,
    borderColor: '#1E293B',
  },
  phoneOuterMobile: {
    width: 290,
    height: 590,
    borderRadius: 36,
    padding: 6,
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
    overflow: 'hidden',
  },
  realAppImage: {
    width: '100%',
    height: '100%',
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
  previewCaption: {
    fontSize: 12,
    color: '#94A3B8',
    marginTop: 12,
    fontWeight: '600',
    textAlign: 'center',
  },
});
