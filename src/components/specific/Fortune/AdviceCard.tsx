import React, { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS, useAppTheme, type ThemeColors } from '../../../constants/theme';

interface AdviceCardProps {
  advice?: string;
}

export const AdviceCard: React.FC<AdviceCardProps> = ({
  advice = '"오늘 하루, 나 자신에게 \'수고했어\'라고 먼저 말해주세요. 작은 친절 하나가 병동 전체를 따뜻하게 만듭니다."',
}) => {
  const theme = useAppTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  return (
    <View style={styles.adviceCard}>
      <View style={styles.adviceContent}>
        <Text style={styles.adviceTitle}>🌿 오늘의 힐링 조언</Text>
        <Text style={styles.adviceDesc}>{advice}</Text>
      </View>
    </View>
  );
};

const createStyles = (theme: ThemeColors) => StyleSheet.create({
  adviceCard: {
    flexDirection: 'row',
    backgroundColor: theme.primaryTint,
    borderRadius: 18,
    padding: 16,
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: theme.primaryTintBorder,
  },
  adviceContent: {
    flex: 1,
    gap: 4,
  },
  adviceTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: theme.primary,
  },
  adviceDesc: {
    fontSize: 15,
    color: COLORS.textPrimary,
    lineHeight: 22,
    fontWeight: '500',
  },
});

