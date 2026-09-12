import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { COLORS, TINT_COLORS } from '../../../constants/theme';
import { PREMIUM_COLORS } from '../../../constants/premiumTheme';

interface MyPageBurnoutBannerProps {
  onPress: () => void;
}

export const MyPageBurnoutBanner: React.FC<MyPageBurnoutBannerProps> = ({ onPress }) => {
  return (
    <TouchableOpacity
      style={styles.burnoutBannerCard}
      onPress={onPress}
      activeOpacity={0.85}
      accessibilityRole="button"
      accessibilityLabel="스마트 듀티 건강 및 번아웃 분석 보기"
    >
      <View style={styles.burnoutBannerLeft}>
        <View style={styles.burnoutBannerIconBox}>
          <Text style={styles.burnoutBannerEmoji}>🩺</Text>
        </View>
        <View style={styles.burnoutBannerTexts}>
          <View style={styles.burnoutBannerTitleRow}>
            <Text style={styles.burnoutBannerTitle}>스마트 듀티 건강 & 번아웃 분석</Text>
            <View style={styles.proTagSmall}>
              <Text style={styles.proTagSmallText}>weganda+</Text>
            </View>
          </View>
          <Text style={styles.burnoutBannerSub}>
            퐁당퐁당(N-O-D), 연속 나이트, 수면부채를 AI가 분석하고 골든타임을 지켜드려요
          </Text>
        </View>
      </View>
      <Text style={styles.burnoutBannerArrow}>분석 보기 ›</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  burnoutBannerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: TINT_COLORS.greenTint,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1.5,
    borderColor: TINT_COLORS.greenTintBorder,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  burnoutBannerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },
  burnoutBannerIconBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: TINT_COLORS.greenTintStrong,
    alignItems: 'center',
    justifyContent: 'center',
  },
  burnoutBannerEmoji: {
    fontSize: 22,
  },
  burnoutBannerTexts: {
    flex: 1,
  },
  burnoutBannerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  burnoutBannerTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: TINT_COLORS.greenTextDark,
  },
  burnoutBannerSub: {
    fontSize: 12,
    color: TINT_COLORS.greenTextMid,
    lineHeight: 16,
  },
  burnoutBannerArrow: {
    fontSize: 13,
    fontWeight: '700',
    color: TINT_COLORS.greenIcon,
    marginLeft: 8,
  },
  proTagSmall: {
    backgroundColor: PREMIUM_COLORS.gold,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  proTagSmallText: {
    fontSize: 10,
    fontWeight: '900',
    color: COLORS.background,
  },
});

