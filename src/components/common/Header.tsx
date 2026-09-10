import React, { ReactNode } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ViewStyle } from 'react-native';
import { COLORS } from '../../constants/theme';

interface HeaderProps {
  title: string;
  leftElement?: ReactNode;
  rightElement?: ReactNode;
  onBack?: () => void;
  style?: ViewStyle;
}

export const Header: React.FC<HeaderProps> = ({
  title,
  leftElement,
  rightElement,
  onBack,
  style,
}) => {
  return (
    <View style={[styles.container, style]}>
      <View style={styles.sideContainer}>
        {onBack ? (
          <TouchableOpacity
            onPress={onBack}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            accessibilityRole="button"
            accessibilityLabel="뒤로 가기"
          >
            <Text style={styles.backText}>‹</Text>
          </TouchableOpacity>
        ) : (
          leftElement
        )}
      </View>
      <Text style={styles.title} numberOfLines={1}>
        {title}
      </Text>
      <View style={[styles.sideContainer, styles.rightAlign]}>
        {rightElement}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 52,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  sideContainer: {
    minWidth: 40,
    justifyContent: 'center',
  },
  rightAlign: {
    alignItems: 'flex-end',
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.textPrimary,
    textAlign: 'center',
    flex: 1,
  },
  backText: {
    fontSize: 32,
    lineHeight: 32,
    color: COLORS.textPrimary,
    fontWeight: '300',
  },
});

