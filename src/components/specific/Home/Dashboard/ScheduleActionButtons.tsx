import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { COLORS, useAppTheme } from '../../../../constants/theme';
import Svg, { Path, Rect } from 'react-native-svg';

interface ScheduleActionButtonsProps {
  onOpenFriendsCalendar: () => void;
  onOpenAddSchedule: () => void;
}

export const ScheduleActionButtons: React.FC<ScheduleActionButtonsProps> = ({
  onOpenFriendsCalendar,
  onOpenAddSchedule,
}) => {
  const theme = useAppTheme();

  return (
    <View style={styles.scheduleButtonRow}>
      {/* 1. 친구 캘린더 보기 버튼 */}
      <TouchableOpacity
        style={styles.actionBtn}
        onPress={onOpenFriendsCalendar}
        activeOpacity={0.7}
      >
        <Svg width={18} height={18} viewBox="0 0 24 24" fill="none" style={styles.btnIcon}>
          <Rect x="3" y="4" width="18" height="18" rx="2" stroke={theme.primary} strokeWidth="2" />
          <Path d="M16 2V6M8 2V6M3 10H21" stroke={theme.primary} strokeWidth="2" strokeLinecap="round" />
        </Svg>
        <Text style={styles.friendBtnText}>친구 캘린더 보기</Text>
      </TouchableOpacity>

      {/* 2. 근무표 직접 등록 버튼 */}
      <TouchableOpacity
        style={styles.actionBtn}
        onPress={onOpenAddSchedule}
        activeOpacity={0.7}
      >
        <Svg width={18} height={18} viewBox="0 0 24 24" fill="none" style={styles.btnIcon}>
          <Rect x="3" y="3" width="18" height="18" rx="4" fill={theme.primary} />
          <Path d="M12 8V16M8 12H16" stroke={COLORS.background} strokeWidth="2.2" strokeLinecap="round" />
        </Svg>
        <Text style={[styles.addBtnText, { color: theme.primary }]}>근무표 직접 등록</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  scheduleButtonRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 20,
  },
  actionBtn: {
    flex: 1,
    height: 50,
    backgroundColor: COLORS.background,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
    paddingHorizontal: 8,
  },
  btnIcon: {
    marginRight: 6,
  },
  friendBtnText: {
    color: COLORS.textPrimary,
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
  addBtnText: {
    color: COLORS.primary,
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
});

