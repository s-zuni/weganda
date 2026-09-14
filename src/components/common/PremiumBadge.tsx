import React from 'react';
import { TouchableOpacity, Text, View, StyleSheet } from 'react-native';
import { CrownIcon } from './Icon';
import { COLORS } from '../../constants/theme';

export interface PremiumBadgeProps {
  isPremium: boolean;
  onPress: () => void;
  compact?: boolean;
}

export const PremiumBadge: React.FC<PremiumBadgeProps> = ({
  isPremium,
  onPress,
  compact = false,
}) => {
  return (
    <TouchableOpacity
      style={[
        styles.container,
        isPremium ? styles.premiumContainer : styles.freeContainer,
        compact && styles.compactContainer,
      ]}
      onPress={onPress}
      activeOpacity={0.82}
      accessibilityRole="button"
      accessibilityLabel={isPremium ? 'weganda+ 구독 관리' : 'weganda+ 혜택 알아보기'}
    >
      <View style={styles.content}>
        <CrownIcon size={compact ? 16 : 18} color={isPremium ? '#10B981' : COLORS.primary} />
        <Text
          style={[
            styles.text,
            isPremium ? styles.premiumText : styles.freeText,
            compact && styles.compactText,
          ]}
        >
          {isPremium ? 'weganda+ 이용 중' : '✨ weganda+ 혜택 알아보기'}
        </Text>
      </View>
      <Text style={[styles.linkText, isPremium ? styles.premiumLinkText : styles.freeLinkText, compact && styles.compactLinkText]}>
        {isPremium ? '구독 관리 ›' : '자세히 ›'}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: 14,
    borderWidth: 1,
    minHeight: 48,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  compactContainer: {
    minHeight: 38,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
  },
  premiumContainer: {
    backgroundColor: '#F0FDF4',
    borderColor: '#BBF7D0',
  },
  freeContainer: {
    backgroundColor: '#FFF5F7',
    borderColor: '#FFD1DC',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  text: {
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: -0.3,
  },
  compactText: {
    fontSize: 13,
  },
  premiumText: {
    color: '#15803D',
  },
  freeText: {
    color: '#FF507C',
  },
  linkText: {
    fontSize: 13,
    fontWeight: '600',
    letterSpacing: -0.2,
  },
  premiumLinkText: {
    color: '#16A34A',
  },
  freeLinkText: {
    color: '#FF507C',
  },
  compactLinkText: {
    fontSize: 12,
  },
});
