import React, { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS, useAppTheme, type ThemeColors } from '../../../constants/theme';

export interface MembershipLaunchPromoBannerProps {
  isFreeTrialActive: boolean;
  trialDays?: number;
}

export const MembershipLaunchPromoBanner: React.FC<MembershipLaunchPromoBannerProps> = ({
  isFreeTrialActive,
  trialDays = 30,
}) => {
  const theme = useAppTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  if (!isFreeTrialActive) return null;

  return (
    <View style={styles.launchEventBanner}>
      <View style={styles.eventBannerBadge}>
        <Text style={styles.eventBannerBadgeText}>출시 기념 특가</Text>
      </View>
      <Text style={styles.eventBannerTitle}>첫 {trialDays}일 0원 무료 체험 혜택</Text>
      <Text style={styles.eventBannerDesc}>
        스토어 결제 수단 등록 후{' '}
        <Text style={styles.eventBannerDescHighlight}>{trialDays}일 간 무료로 이용하세요.</Text>
        {'\n'}무료 기간 종료 전 언제든 마이페이지에서 위약금 없이 해지 가능합니다.
      </Text>
    </View>
  );
};

const createStyles = (theme: ThemeColors) => StyleSheet.create({
  launchEventBanner: {
    alignItems: 'center',
    paddingHorizontal: 24,
    marginTop: -8,
    marginBottom: 16,
  },
  eventBannerBadge: {
    alignSelf: 'center',
    backgroundColor: theme.primary,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    marginBottom: 10,
  },
  eventBannerBadgeText: {
    color: theme.onPrimaryText,
    fontSize: 11,
    fontWeight: '800',
  },
  eventBannerTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: COLORS.textPrimary,
    marginBottom: 8,
    textAlign: 'center',
  },
  eventBannerDesc: {
    fontSize: 12,
    color: COLORS.textSecondary,
    lineHeight: 18,
    textAlign: 'center',
  },
  eventBannerDescHighlight: {
    color: COLORS.textPrimary,
    fontWeight: '700',
  },
});

