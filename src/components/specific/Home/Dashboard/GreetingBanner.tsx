import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS } from '../../../../constants/theme';
import { ShiftCode, ShiftInfo } from '../../../../types/shift';
import { useUserStore } from '../../../../store/useUserStore';

interface GreetingBannerProps {
  displayName?: string;
  todayShift: string | null;
  todayShiftInfo: ShiftInfo | null;
}

export const GreetingBanner: React.FC<GreetingBannerProps> = ({
  displayName: propDisplayName,
  todayShift,
  todayShiftInfo,
}) => {
  const userNickname = useUserStore((s) => s.nickname);
  const userName = useUserStore((s) => s.name);
  const activeDisplayName = userNickname || userName || propDisplayName || '김간호';

  return (
    <View style={styles.greetingBanner}>
      <Text style={styles.greetingText}>
        {activeDisplayName}님, 오늘은{' '}
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
    fontSize: 19,
    color: COLORS.textPrimary,
    lineHeight: 28,
    fontWeight: '600',
  },
  dutyHighlight: {
    color: '#4F98CA',
    fontWeight: '800',
  },
  greetingSubText: {
    fontSize: 15,
    color: COLORS.textSecondary,
    marginTop: 4,
    lineHeight: 22,
  },
});

