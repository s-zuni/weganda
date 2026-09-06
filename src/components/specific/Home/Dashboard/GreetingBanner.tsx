import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS } from '../../../../constants/theme';
import { ShiftCode, ShiftInfo } from '../../../../types/shift';

interface GreetingBannerProps {
  displayName: string;
  todayShift: ShiftCode | null;
  todayShiftInfo: ShiftInfo | null;
}

export const GreetingBanner: React.FC<GreetingBannerProps> = ({
  displayName,
  todayShift,
  todayShiftInfo,
}) => {
  return (
    <View style={styles.greetingBanner}>
      <Text style={styles.greetingText}>
        {displayName}님, 오늘은{' '}
        {todayShiftInfo ? (
          <Text style={[styles.dutyHighlight, { color: todayShiftInfo.color }]}>
            {todayShiftInfo.shortName} 근무
          </Text>
        ) : (
          <Text style={styles.dutyHighlight}>근무 일정 확인</Text>
        )}
        이시네요.
      </Text>
      <Text style={styles.greetingSubText}>
        {todayShift === 'O' || todayShift === 'V'
          ? '달콤한 오프! 재충전 가득한 하루 보내세요 ☕'
          : '오늘도 안전 간호와 건강한 하루를 응원합니다!'}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  greetingBanner: {
    marginTop: 6,
    marginBottom: 20,
  },
  greetingText: {
    fontSize: 16,
    color: COLORS.textPrimary,
    lineHeight: 24,
    fontWeight: '500',
  },
  dutyHighlight: {
    color: '#4F98CA',
    fontWeight: '700',
  },
  greetingSubText: {
    fontSize: 14,
    color: COLORS.textMuted,
    marginTop: 2,
  },
});

