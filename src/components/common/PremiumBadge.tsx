import React from 'react';
import { TouchableOpacity, Text, View, StyleSheet } from 'react-native';
import { CrownIcon } from './Icon';
import { COLORS } from '../../constants/theme';
import { PREMIUM_COLORS } from '../../constants/premiumTheme';

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
      activeOpacity={0.8}
    >
      <View style={styles.content}>
        {isPremium && <CrownIcon size={compact ? 16 : 20} color={PREMIUM_COLORS.gold} />}
        <Text
          style={[
            styles.text,
            isPremium ? styles.premiumText : styles.freeText,
            compact && styles.compactText,
          ]}
        >
          {isPremium ? '👑 weganda+ 이용 중' : '✨ weganda+ 알아보기 ›'}
        </Text>
      </View>
      {isPremium && (
        <Text style={[styles.linkText, compact && styles.compactLinkText]}>
          구독 관리 {'>'}
        </Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: 16,
    borderWidth: 1,
    minHeight: 44,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  compactContainer: {
    minHeight: 36,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  premiumContainer: {
    backgroundColor: '#FFF8E7',
    borderColor: '#F5E6C8',
  },
  freeContainer: {
    backgroundColor: '#FFE8EE', // primaryTint fallback
    borderColor: 'transparent',
    justifyContent: 'center', // Center text for free version
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  text: {
    fontSize: 16,
    fontWeight: '600',
  },
  compactText: {
    fontSize: 14,
  },
  premiumText: {
    color: '#B8922E', // PREMIUM_COLORS.goldText
  },
  freeText: {
    color: COLORS.primary, // #FF507C
  },
  linkText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#B8922E',
  },
  compactLinkText: {
    fontSize: 12,
  },
});
