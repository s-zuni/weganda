import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { CrownIcon } from '../../common/Icon';
import { PREMIUM_COLORS } from '../../../constants/premiumTheme';
import { COLORS } from '../../../constants/theme';

export interface MembershipHeaderProps {
  onClose: () => void;
}

export const MembershipHeader: React.FC<MembershipHeaderProps> = ({ onClose }) => {
  const insets = useSafeAreaInsets();

  return (
    <>
      <TouchableOpacity
        onPress={onClose}
        style={[styles.closeButton, { top: Math.max(insets.top, Platform.OS === 'ios' ? 10 : 20) }]}
        accessibilityRole="button"
        accessibilityLabel="닫기"
      >
        <Text style={styles.closeButtonText}>← 닫기</Text>
      </TouchableOpacity>

      <View style={[styles.heroSection, { paddingBottom: Math.max(insets.bottom, 16) + 20 }]}>
        <View style={styles.crownContainer}>
          <CrownIcon size={48} color={PREMIUM_COLORS.gold} />
        </View>
        <Text style={styles.heroTitle}>weganda+</Text>
        <Text style={styles.heroSubtitle}>당신의 간호 라이프를</Text>
        <Text style={styles.heroSubtitle}>한 단계 높여보세요</Text>
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  closeButton: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 10 : 20,
    left: 20,
    zIndex: 10,
    minWidth: 44,
    minHeight: 44,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 22,
    backgroundColor: 'rgba(0, 0, 0, 0.35)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeButtonText: {
    color: COLORS.onPrimaryText,
    fontSize: 15,
    fontWeight: '700',
  },
  heroSection: {
    backgroundColor: PREMIUM_COLORS.heroBg,
    paddingTop: 80,
    alignItems: 'center',
  },
  crownContainer: {
    marginBottom: 16,
  },
  heroTitle: {
    fontSize: 32,
    fontWeight: '800',
    color: PREMIUM_COLORS.gold,
    marginBottom: 12,
  },
  heroSubtitle: {
    fontSize: 18,
    color: PREMIUM_COLORS.heroSubText,
    lineHeight: 26,
  },
});

