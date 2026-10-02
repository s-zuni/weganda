import React, { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { HeartIcon } from '../../common/Icon';
import { COLORS, useAppTheme, type ThemeColors } from '../../../constants/theme';

export const MembershipImpactNote: React.FC = () => {
  const theme = useAppTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  return (
    <View style={styles.container}>
      <View style={styles.iconCircle}>
        <HeartIcon size={18} color={theme.primary} />
      </View>
      <View style={styles.textGroup}>
        <Text style={styles.title}>멤버십 수익의 일부가 나눔이 됩니다</Text>
        <Text style={styles.desc}>
          weganda+ 구독료 일부는 간호사 권익 증진 활동, 간호대학생{'\n'}
          장학금, 그리고 간호가 필요한 소외계층 아동 지원 등{' '}
          <Text style={styles.descHighlight}>간호 영향력 확대</Text>에 사용됩니다.
        </Text>
      </View>
    </View>
  );
};

const createStyles = (theme: ThemeColors) => StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 16,
  },
  iconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: theme.primaryTint,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  textGroup: {
    flex: 1,
  },
  title: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 4,
  },
  desc: {
    fontSize: 12,
    color: COLORS.textSecondary,
    lineHeight: 18,
  },
  descHighlight: {
    color: COLORS.textPrimary,
    fontWeight: '700',
  },
});
