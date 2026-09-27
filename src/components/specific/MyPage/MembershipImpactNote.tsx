import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { HeartIcon } from '../../common/Icon';
import { COLORS, TINT_COLORS } from '../../../constants/theme';

export const MembershipImpactNote: React.FC = () => {
  return (
    <View style={styles.container}>
      <View style={styles.iconCircle}>
        <HeartIcon size={20} color={COLORS.primary} />
      </View>
      <View style={styles.textGroup}>
        <Text style={styles.title}>멤버십 수익의 일부가 나눔이 됩니다</Text>
        <Text style={styles.desc}>
          weganda+ 구독료 일부는 간호사 권익 증진 활동, 간호대학생 장학금,{'\n'}
          그리고 간호가 필요한 소외계층 아동 지원에 사용됩니다.
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: TINT_COLORS.pinkTint,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: TINT_COLORS.pinkTintBorder,
    padding: 16,
    marginTop: 20,
  },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.background,
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
});
