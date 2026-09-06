import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { LockIcon } from './Icon';
import { COLORS } from '../../constants/theme';

export interface PremiumLockOverlayProps {
  message?: string;
  onUpgradePress: () => void;
  compact?: boolean;
}

export const PremiumLockOverlay: React.FC<PremiumLockOverlayProps> = ({
  message = 'weganda+ 전용 기능이에요',
  onUpgradePress,
  compact = false,
}) => {
  return (
    <View style={styles.overlay}>
      <View style={styles.content}>
        <View style={[styles.iconContainer, compact && styles.compactIconContainer]}>
          <LockIcon size={compact ? 20 : 24} color={COLORS.textMuted} />
        </View>
        
        <Text style={[styles.message, compact && styles.compactMessage]}>
          {message}
        </Text>

        <TouchableOpacity 
          style={[styles.button, compact && styles.compactButton]} 
          onPress={onUpgradePress}
          activeOpacity={0.8}
        >
          <Text style={[styles.buttonText, compact && styles.compactButtonText]}>
            weganda+ 구독하기
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.92)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  content: {
    alignItems: 'center',
    padding: 20,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F3F4F6', // gray100
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  compactIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginBottom: 12,
  },
  message: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: 20,
    textAlign: 'center',
  },
  compactMessage: {
    fontSize: 14,
    marginBottom: 16,
  },
  button: {
    backgroundColor: COLORS.primary, // #FF507C
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 9999, // rounded-full (pill)
    minHeight: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  compactButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    minHeight: 40,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  compactButtonText: {
    fontSize: 14,
  },
});
