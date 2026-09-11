import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS, useAppTheme } from '../../../../constants/theme';
import { SHIFT_TYPES } from '../../../../constants/shiftTypes';
import { ShiftCode } from '../../../../types/shift';

export interface WeekDayItem {
  day: string;
  date: number;
  dateKey: string;
  shift: ShiftCode | null;
  isToday: boolean;
}

interface WeeklyCalendarStripProps {
  weekData: WeekDayItem[];
}

export const WeeklyCalendarStrip: React.FC<WeeklyCalendarStripProps> = ({ weekData }) => {
  const theme = useAppTheme();
  return (
    <View style={styles.weekCard}>
      <View style={styles.weekStrip}>
        {weekData.map((item, idx) => {
          const shiftInfo = item.shift ? SHIFT_TYPES[item.shift] : null;
          const isSunday = idx === 0;
          const isSaturday = idx === 6;
          return (
            <View key={item.dateKey} style={styles.dayColumn}>
              <Text
                style={[
                  styles.dayLabel,
                  isSunday && styles.sundayLabel,
                  isSaturday && styles.saturdayLabel,
                ]}
              >
                {item.day}
              </Text>

              {item.isToday ? (
                <View style={[styles.todayCircle, { backgroundColor: theme.primary }]}>
                  <Text style={[styles.todaySubText, { color: theme.onPrimaryText }]}>오늘</Text>
                  <Text style={[styles.todayDateText, { color: theme.onPrimaryText }]}>{item.date}</Text>
                </View>
              ) : (
                <Text
                  style={[
                    styles.dateText,
                    isSunday && styles.sundayLabel,
                    isSaturday && styles.saturdayLabel,
                  ]}
                >
                  {item.date}
                </Text>
              )}

              {item.shift && shiftInfo ? (
                <View style={[styles.shiftBadge, { backgroundColor: shiftInfo.color }]}>
                  <Text style={styles.shiftBadgeText}>
                    {item.shift === 'O' ? 'OFF' : item.shift}
                  </Text>
                </View>
              ) : (
                <View style={styles.emptyShiftSpace} />
              )}
            </View>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  weekCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    paddingVertical: 16,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  weekStrip: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  dayColumn: {
    alignItems: 'center',
    flex: 1,
  },
  dayLabel: {
    fontSize: 13,
    color: COLORS.textMuted,
    marginBottom: 8,
    fontWeight: '600',
  },
  sundayLabel: {
    color: '#EF4444',
  },
  saturdayLabel: {
    color: '#3B82F6',
  },
  dateText: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 8,
  },
  todayCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  todaySubText: {
    fontSize: 9,
    color: '#FFFFFF',
    fontWeight: '700',
    lineHeight: 10,
  },
  todayDateText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#FFFFFF',
    lineHeight: 15,
  },
  shiftBadge: {
    width: 38,
    height: 28,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 2,
    elevation: 1,
  },
  shiftBadgeText: {
    fontSize: 13,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  emptyShiftSpace: {
    height: 28,
  },
});

