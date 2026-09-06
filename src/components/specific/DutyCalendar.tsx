import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { SHIFT_TYPES, ShiftCode } from '../../constants/shiftTypes';
import { COLORS } from '../../constants/theme';

interface DutyCalendarProps {
  currentDate: Date;
  schedules?: Record<string, ShiftCode>; // "2026-08-27": "D"
  onSelectDate?: (dateStr: string) => void;
}

export const DutyCalendar: React.FC<DutyCalendarProps> = ({
  currentDate,
  schedules = {},
  onSelectDate,
}) => {
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const firstDayIndex = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const daysOfWeek = ['일', '월', '화', '수', '목', '금', '토'];

  const renderDays = () => {
    const days = [];

    // Empty padding days before the 1st
    for (let i = 0; i < firstDayIndex; i++) {
      days.push(<View key={`empty-${i}`} style={styles.dayCell} />);
    }

    // Actual days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const monthStr = String(month + 1).padStart(2, '0');
      const dayStr = String(day).padStart(2, '0');
      const dateKey = `${year}-${monthStr}-${dayStr}`;
      const shiftCode = schedules[dateKey];
      const shiftInfo = shiftCode ? SHIFT_TYPES[shiftCode] : null;

      days.push(
        <TouchableOpacity
          key={dateKey}
          style={styles.dayCell}
          onPress={() => onSelectDate?.(dateKey)}
          activeOpacity={0.7}
        >
          <Text style={styles.dayText}>{day}</Text>
          {shiftInfo ? (
            <View
              style={[
                styles.shiftBadge,
                { backgroundColor: shiftInfo.color },
              ]}
            >
              <Text style={[styles.shiftBadgeText, { color: shiftInfo.textColor }]}>
                {shiftInfo.code}
              </Text>
            </View>
          ) : (
            <View style={styles.emptyShiftBadge} />
          )}
        </TouchableOpacity>
      );
    }

    return days;
  };

  return (
    <View style={styles.container}>
      {/* 요일 헤더 */}
      <View style={styles.weekHeader}>
        {daysOfWeek.map((day, idx) => (
          <Text
            key={day}
            style={[
              styles.weekText,
              idx === 0 ? styles.sundayText : idx === 6 ? styles.saturdayText : null,
            ]}
          >
            {day}
          </Text>
        ))}
      </View>

      {/* 날짜 그리드 */}
      <View style={styles.grid}>{renderDays()}</View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  weekHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.divider,
  },
  weekText: {
    width: '14.28%',
    textAlign: 'center',
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  sundayText: {
    color: '#EF4444',
  },
  saturdayText: {
    color: '#3B82F6',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
  },
  dayCell: {
    width: '14.28%',
    height: 56,
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingTop: 4,
  },
  dayText: {
    fontSize: 13,
    fontWeight: '500',
    color: COLORS.textPrimary,
  },
  shiftBadge: {
    marginTop: 4,
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyShiftBadge: {
    marginTop: 4,
    width: 24,
    height: 24,
  },
  shiftBadgeText: {
    fontSize: 12,
    fontWeight: '700',
  },
});

