import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { COLORS } from '../../../../constants/theme';

interface ScheduleActionButtonsProps {
  onOpenFullSchedule: () => void;
  onOpenAddSchedule: () => void;
}

export const ScheduleActionButtons: React.FC<ScheduleActionButtonsProps> = ({
  onOpenFullSchedule,
  onOpenAddSchedule,
}) => {
  return (
    <View style={styles.scheduleButtonRow}>
      <TouchableOpacity
        style={styles.schedulePillBtn}
        onPress={onOpenFullSchedule}
        activeOpacity={0.85}
      >
        <Text style={styles.schedulePillBtnText}>전체 스케줄 보기  ›</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.schedulePillBtn}
        onPress={onOpenAddSchedule}
        activeOpacity={0.85}
      >
        <Text style={styles.schedulePillBtnText}>스케줄 추가하기  +</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  scheduleButtonRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 28,
  },
  schedulePillBtn: {
    flex: 1,
    backgroundColor: COLORS.primary,
    paddingVertical: 14,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 4,
  },
  schedulePillBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
});

