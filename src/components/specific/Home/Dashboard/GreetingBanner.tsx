import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS } from '../../../../constants/theme';
import { ShiftInfo } from '../../../../types/shift';

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
  const activeDisplayName = propDisplayName || '김간호사';

  // 근무 유형에 따른 라벨 생성 (예: D (주간) 근무, E (오후) 근무, N (야간) 근무, O (휴무) 등)
  const getDutyFullLabel = () => {
    if (!todayShiftInfo) return '근무 일정 확인';
    if (todayShiftInfo.code === 'D') return 'D (주간) 근무';
    if (todayShiftInfo.code === 'E') return 'E (오후) 근무';
    if (todayShiftInfo.code === 'N') return 'N (야간) 근무';
    if (todayShiftInfo.code === 'O') return 'O (휴무)';
    if (todayShiftInfo.code === 'V') return 'V (연차)';
    return `${todayShiftInfo.code} (${todayShiftInfo.shortName}) 근무`;
  };

  const highlightColor = todayShiftInfo ? todayShiftInfo.color : '#3182F6';

  return (
    <View style={styles.greetingBanner}>
      <Text style={styles.greetingText}>
        {activeDisplayName}님, 오늘은{' '}
        <Text style={[styles.dutyHighlight, { color: highlightColor }]}>
          {getDutyFullLabel()}
        </Text>
        이시네요.
      </Text>
      <Text style={styles.greetingSubText}>
        {todayShift === 'O' || todayShift === 'V'
          ? '달콤한 오프! 재충전 가득한 하루 보내세요 ☕'
          : '오늘도 안전 간호와 건강한 하루를 응원합니다! 🩺'}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  greetingBanner: {
    marginTop: 8,
    marginBottom: 24,
  },
  greetingText: {
    fontSize: 22,
    color: '#191F28',
    lineHeight: 32,
    fontWeight: '800',
    letterSpacing: -0.4,
  },
  dutyHighlight: {
    fontWeight: '800',
  },
  greetingSubText: {
    fontSize: 15,
    color: '#8B95A1',
    marginTop: 6,
    lineHeight: 22,
    fontWeight: '500',
  },
});

