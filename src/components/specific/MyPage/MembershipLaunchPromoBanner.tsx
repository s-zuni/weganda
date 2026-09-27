import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS, TINT_COLORS } from '../../../constants/theme';

export interface MembershipLaunchPromoBannerProps {
  isFreeTrialActive: boolean;
  trialDays?: number;
}

export const MembershipLaunchPromoBanner: React.FC<MembershipLaunchPromoBannerProps> = ({
  isFreeTrialActive,
  trialDays = 30,
}) => {
  if (!isFreeTrialActive) return null;

  return (
    <View style={styles.launchEventBanner}>
      <Text style={styles.eventBannerBadge}>런칭 기념 특가</Text>
      <Text style={styles.eventBannerTitle}>첫 {trialDays}일 0원 무료 체험 혜택</Text>
      <Text style={styles.eventBannerDesc}>
        스토어 결제 수단 등록 후 {trialDays}일간 무료로 이용하세요.{'\n'}
        무료 기간 종료 전 언제든 마이페이지에서 위약금 없이 해지 가능합니다.
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  launchEventBanner: {
    backgroundColor: TINT_COLORS.pinkTint,
    borderWidth: 1.5,
    borderColor: TINT_COLORS.pinkTintBorder,
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 20,
    marginTop: -20,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  eventBannerBadge: {
    alignSelf: 'flex-start',
    backgroundColor: COLORS.primary,
    color: COLORS.onPrimaryText,
    fontSize: 11,
    fontWeight: '800',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    marginBottom: 6,
    overflow: 'hidden',
  },
  eventBannerTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.textPrimary,
    marginBottom: 4,
  },
  eventBannerDesc: {
    fontSize: 12,
    color: COLORS.textSecondary,
    lineHeight: 18,
  },
});

