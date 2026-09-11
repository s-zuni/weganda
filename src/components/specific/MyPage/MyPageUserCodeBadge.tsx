import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { useAppTheme } from '../../../constants/theme';

interface MyPageUserCodeBadgeProps {
  userCode?: string | null;
  onCopy: () => void;
}

export const MyPageUserCodeBadge: React.FC<MyPageUserCodeBadgeProps> = ({ userCode, onCopy }) => {
  const theme = useAppTheme();
  if (!userCode) return null;

  return (
    <TouchableOpacity
      onPress={onCopy}
      style={[styles.userCodeBadge, { backgroundColor: theme.primaryTint }]}
      activeOpacity={0.7}
      accessibilityLabel="간호사 고유번호 복사"
    >
      <Text style={[styles.userCodeBadgeText, { color: theme.primary }]}>#{userCode}</Text>
      <Text style={[styles.userCodeCopyIcon, { color: theme.primary }]}>❐</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  userCodeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  userCodeBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    fontFamily: 'monospace',
  },
  userCodeCopyIcon: {
    fontSize: 11,
    fontWeight: '700',
  },
});
