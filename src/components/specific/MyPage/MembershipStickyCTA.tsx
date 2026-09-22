import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform, Linking } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MembershipPlanKey, CurrentPlanPricing } from '../../../types/membershipEvent';
import { COLORS, NEUTRAL, TINT_COLORS } from '../../../constants/theme';
import { PREMIUM_COLORS } from '../../../constants/premiumTheme';

export interface MembershipStickyCTAProps {
  isPremium: boolean;
  selectedPlan: MembershipPlanKey;
  currentPricing: CurrentPlanPricing;
  isRestoring: boolean;
  trialDays?: number;
  onSubscribe: () => void;
  onRestore: () => void;
  onClose: () => void;
}

export const MembershipStickyCTA: React.FC<MembershipStickyCTAProps> = ({
  isPremium,
  selectedPlan,
  currentPricing,
  isRestoring,
  trialDays = 30,
  onSubscribe,
  onRestore,
  onClose,
}) => {
  const insets = useSafeAreaInsets();

  const handleOpenUrl = (url: string) => {
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      window.open(url, '_blank');
    } else {
      Linking.openURL(url).catch((err) => console.warn(err));
    }
  };

  return (
    <View style={[styles.stickyCTA, { paddingBottom: Math.max(insets.bottom, 16) + 12 }]}>
      {!isPremium ? (
        <>
          <TouchableOpacity
            style={styles.subscribeButton}
            onPress={onSubscribe}
            activeOpacity={0.85}
            accessibilityRole="button"
            accessibilityLabel="우간다+ 구독하기"
          >
            <Text style={styles.subscribeText}>
              {currentPricing.isFreeTrialActive
                ? `${trialDays}일 무료 체험 시작하기`
                : `우간다+ 구독하기 (${selectedPlan === 'monthly' ? '월' : '연'} ${currentPricing.currentPrice.toLocaleString()}원)`}
            </Text>
          </TouchableOpacity>
          <View style={styles.captionRow}>
            <Text style={styles.ctaCaption}>
              {currentPricing.isFreeTrialActive
                ? `${trialDays}일 무료 체험 후 ${selectedPlan === 'monthly' ? `월 ${currentPricing.currentPrice.toLocaleString()}원` : `연 ${currentPricing.currentPrice.toLocaleString()}원`} 자동 결제`
                : '스토어 계정으로 안전하게 결제'}
            </Text>
            <Text style={styles.captionDot}>•</Text>
            <TouchableOpacity
              onPress={onRestore}
              disabled={isRestoring}
              accessibilityRole="button"
              accessibilityLabel="구매 복원"
            >
              <Text style={styles.restoreText}>
                {isRestoring ? '복원 중...' : '구매 복원'}
              </Text>
            </TouchableOpacity>
          </View>
          <View style={styles.legalRow}>
            <Text style={styles.cancelAnytimeNotice}>
              * 무료 체험 종료 전 언제든 마이페이지에서 위약금 없이 해지 가능합니다.
            </Text>
          </View>
          <View style={[styles.legalRow, { marginTop: 4 }]}>
            <TouchableOpacity
              onPress={() => handleOpenUrl('https://www.weganda.kr/membership')}
              accessibilityRole="link"
              accessibilityLabel="멤버십 이용약관"
            >
              <Text style={styles.legalLinkText}>멤버십 이용약관</Text>
            </TouchableOpacity>
            <Text style={styles.legalDot}>•</Text>
            <TouchableOpacity
              onPress={() => handleOpenUrl('https://www.weganda.kr/privacy')}
              accessibilityRole="link"
              accessibilityLabel="개인정보 처리방침"
            >
              <Text style={styles.legalLinkText}>개인정보 처리방침</Text>
            </TouchableOpacity>
          </View>
        </>
      ) : (
        <TouchableOpacity
          style={styles.manageButton}
          onPress={onClose}
          activeOpacity={0.8}
          accessibilityRole="button"
          accessibilityLabel="구독 관리"
        >
          <Text style={styles.manageText}>마이페이지에서 구독 확인하기</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  stickyCTA: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: COLORS.background,
    paddingHorizontal: 20,
    paddingTop: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 10,
    alignItems: 'center',
  },
  subscribeButton: {
    backgroundColor: PREMIUM_COLORS.heroBg,
    width: '100%',
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    shadowColor: PREMIUM_COLORS.heroBg,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 4,
  },
  subscribeText: {
    color: PREMIUM_COLORS.gold,
    fontSize: 17,
    fontWeight: '700',
    lineHeight: 22,
  },
  ctaCaption: {
    fontSize: 13,
    color: COLORS.textMuted,
    lineHeight: 18,
  },
  captionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  captionDot: {
    fontSize: 13,
    color: NEUTRAL.gray300,
  },
  restoreText: {
    fontSize: 13,
    color: NEUTRAL.gray600,
    fontWeight: '600',
    textDecorationLine: 'underline',
    lineHeight: 18,
  },
  legalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 8,
  },
  legalLinkText: {
    fontSize: 12,
    color: COLORS.textMuted,
    textDecorationLine: 'underline',
    lineHeight: 16,
  },
  legalDot: {
    fontSize: 12,
    color: NEUTRAL.gray300,
  },
  manageButton: {
    width: '100%',
    height: 56,
    borderRadius: 28,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  manageText: {
    color: COLORS.textSecondary,
    fontSize: 16,
    fontWeight: '600',
    lineHeight: 22,
  },
  cancelAnytimeNotice: {
    fontSize: 11,
    color: COLORS.textMuted,
    textAlign: 'center',
    lineHeight: 16,
  },
});

