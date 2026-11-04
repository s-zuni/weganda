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
    const days: React.ReactNode[] = [];

    const renderCell = (dateKey: string, dayNum: number, isCurrentMonth: boolean) => {
      const shiftCode = schedules[dateKey];
      const shiftInfo = shiftCode ? SHIFT_TYPES[shiftCode] : null;

      return (
        <TouchableOpacity
          key={dateKey}
          style={[styles.dayCell, !isCurrentMonth && { opacity: 0.85 }]}
          onPress={() => onSelectDate?.(dateKey)}
          activeOpacity={0.7}
        >
          <Text style={[styles.dayText, !isCurrentMonth && { color: '#9CA3AF', fontWeight: '500' }]}>
            {dayNum}
          </Text>
          {shiftInfo ? (
            <View
              style={[
                styles.shiftBadge,
                { backgroundColor: shiftInfo.color },
                !isCurrentMonth && { opacity: 0.65 },
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
    };

    // 1. 이전 달 날짜 및 스케줄 연결
    if (firstDayIndex > 0) {
      const prevMonthLastDate = new Date(year, month, 0).getDate();
      const prevMonthDate = new Date(year, month - 1, 1);
      const prevYear = prevMonthDate.getFullYear();
      const prevMonth = prevMonthDate.getMonth();
      const prevMonthStr = String(prevMonth + 1).padStart(2, '0');

      for (let i = 0; i < firstDayIndex; i++) {
        const prevDay = prevMonthLastDate - firstDayIndex + 1 + i;
        const prevDayStr = String(prevDay).padStart(2, '0');
        const prevDateKey = `${prevYear}-${prevMonthStr}-${prevDayStr}`;
        days.push(renderCell(prevDateKey, prevDay, false));
      }
    }

    // 2. 당월 날짜들
    for (let day = 1; day <= daysInMonth; day++) {
      const monthStr = String(month + 1).padStart(2, '0');
      const dayStr = String(day).padStart(2, '0');
      const dateKey = `${year}-${monthStr}-${dayStr}`;
      days.push(renderCell(dateKey, day, true));
    }

    // 3. 다음 달 날짜 및 스케줄 연결 (7의 배수로 패딩)
    const remainder = days.length % 7;
    if (remainder > 0) {
      const trailingCount = 7 - remainder;
      const nextMonthDate = new Date(year, month + 1, 1);
      const nextYear = nextMonthDate.getFullYear();
      const nextMonth = nextMonthDate.getMonth();
      const nextMonthStr = String(nextMonth + 1).padStart(2, '0');

      for (let day = 1; day <= trailingCount; day++) {
        const nextDayStr = String(day).padStart(2, '0');
        const nextDateKey = `${nextYear}-${nextMonthStr}-${nextDayStr}`;
        days.push(renderCell(nextDateKey, day, false));
      }
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
    fontSize: 14,
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
    height: 60,
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingTop: 4,
  },
  dayText: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  shiftBadge: {
    marginTop: 4,
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyShiftBadge: {
    marginTop: 4,
    width: 26,
    height: 26,
  },
  shiftBadgeText: {
    fontSize: 13,
    fontWeight: '800',
  },
});

