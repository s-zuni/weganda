import React, { useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { CrownIcon } from '../../common/Icon';
import { COLORS, useAppTheme, type ThemeColors } from '../../../constants/theme';

export interface MembershipHeaderProps {
  onClose: () => void;
}

export const MembershipHeader: React.FC<MembershipHeaderProps> = ({ onClose }) => {
  const theme = useAppTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.heroSection, { paddingTop: Math.max(insets.top, Platform.OS === 'ios' ? 10 : 20) + 8 }]}>
      <TouchableOpacity
        onPress={onClose}
        style={styles.closeButton}
        activeOpacity={0.85}
        accessibilityRole="button"
        accessibilityLabel="닫기"
      >
        <Text style={styles.closeButtonText}>← 닫기</Text>
      </TouchableOpacity>

      <View style={styles.crownCircle}>
        <CrownIcon size={36} color={theme.onPrimaryText} />
      </View>
      <Text style={styles.heroTitle}>weganda+</Text>
      <Text style={styles.heroSubtitle}>당신의 간호력을</Text>
      <Text style={styles.heroSubtitle}>한 단계 높여보세요</Text>
    </View>
  );
};

const createStyles = (theme: ThemeColors) => StyleSheet.create({
  heroSection: {
    backgroundColor: COLORS.background,
    alignItems: 'center',
    paddingBottom: 24,
  },
  closeButton: {
    alignSelf: 'flex-start',
    marginLeft: 20,
    marginBottom: 28,
    minWidth: 44,
    minHeight: 44,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 22,
    backgroundColor: theme.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeButtonText: {
    color: theme.onPrimaryText,
    fontSize: 14,
    fontWeight: '700',
  },
  crownCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: theme.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  heroTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: theme.primary,
    marginBottom: 12,
  },
  heroSubtitle: {
    fontSize: 17,
    fontWeight: '700',
    color: COLORS.textPrimary,
    lineHeight: 24,
  },
});

