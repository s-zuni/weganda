import React, { useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { COLORS, useAppTheme, type ThemeColors } from '../../../constants/theme';

interface StudyAiBannerProps {
  onPress: () => void;
}

export const StudyAiBanner: React.FC<StudyAiBannerProps> = ({ onPress }) => {
  const theme = useAppTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  return (
    <TouchableOpacity
      style={styles.askAiBanner}
      onPress={onPress}
      activeOpacity={0.85}
    >
      <View style={styles.askAiLeft}>
        <View>
          <Text style={styles.askAiTitle}>🤖 임상 지식을 AI에게 물어보세요</Text>
          <Text style={styles.askAiSub}>💊 약물 투약법 · ⚡ ACLS 프로토콜 · 📋 SBAR 실시간 답변 ›</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const createStyles = (theme: ThemeColors) => StyleSheet.create({
  askAiBanner: {
    backgroundColor: theme.primaryTint,
    borderRadius: 16,
    padding: 14,
    marginTop: 6,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: theme.primaryTintBorder,
  },
  askAiLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  askAiTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  askAiSub: {
    fontSize: 12,
    color: theme.primary,
    fontWeight: '600',
    marginTop: 2,
  },
});

