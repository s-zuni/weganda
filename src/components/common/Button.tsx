import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator, ViewStyle, TextStyle } from 'react-native';
import { COLORS } from '../../constants/theme';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  disabled?: boolean;
  accessibilityLabel?: string;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  accessibilityLabel,
  style,
  textStyle,
}) => {
  const getContainerStyle = () => {
    const base: ViewStyle = { ...styles.button };

    // Size
    if (size === 'sm') Object.assign(base, styles.sm);
    if (size === 'lg') Object.assign(base, styles.lg);

    // Variant
    if (variant === 'primary') Object.assign(base, styles.primary);
    if (variant === 'secondary') Object.assign(base, styles.secondary);
    if (variant === 'outline') Object.assign(base, styles.outline);
    if (variant === 'ghost') Object.assign(base, styles.ghost);

    if (disabled) Object.assign(base, styles.disabled);

    return base;
  };

  const getTextStyle = () => {
    const base: TextStyle = { ...styles.text };

    if (size === 'sm') base.fontSize = 12;
    if (size === 'lg') base.fontSize = 16;

    if (variant === 'primary') base.color = '#FFFFFF';
    if (variant === 'secondary') base.color = COLORS.primary;
    if (variant === 'outline') base.color = COLORS.primary;
    if (variant === 'ghost') base.color = COLORS.textSecondary;

    if (disabled) base.color = '#9CA3AF';

    return base;
  };

  return (
    <TouchableOpacity
      style={[getContainerStyle(), style]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel || title}
      accessibilityState={{ disabled: disabled || loading, busy: loading }}
    >
      {loading ? (
        <ActivityIndicator color={variant === 'primary' ? '#FFF' : COLORS.primary} />
      ) : (
        <Text style={[getTextStyle(), textStyle]}>{title}</Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  sm: {
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  lg: {
    paddingVertical: 16,
    paddingHorizontal: 24,
  },
  primary: {
    backgroundColor: COLORS.primary,
  },
  secondary: {
    backgroundColor: '#E6F0EC',
  },
  outline: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
  ghost: {
    backgroundColor: 'transparent',
  },
  disabled: {
    backgroundColor: '#E5E7EB',
    borderColor: '#E5E7EB',
  },
  text: {
    fontSize: 14,
    fontWeight: '600',
  },
});

