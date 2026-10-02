import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { COLORS, DATE_KIND_COLORS, useAppTheme } from '../../../constants/theme';
import {
  DateKind,
  DATE_KIND_LABEL,
  formatDateKeyKorean,
  getDateKind,
  shiftDateKey,
  todayKey,
} from '../../../utils/dateKind';

interface DailyNoteDateBarProps {
  selectedDate: string;
  /** 메모가 존재하는 날짜 목록 (정렬 불필요) */
  noteDates: string[];
  onSelectDate: (date: string) => void;
}

export const useDateKindColors = () => {
  const theme = useAppTheme();
  return (kind: DateKind) =>
    kind === 'today'
      ? { fg: theme.primary, bg: theme.primaryTint, border: theme.primary }
      : DATE_KIND_COLORS[kind];
};

export const DailyNoteDateBar: React.FC<DailyNoteDateBarProps> = ({
  selectedDate,
  noteDates,
  onSelectDate,
}) => {
  const kindColors = useDateKindColors();
  const today = todayKey();
  const selectedKind = getDateKind(selectedDate, today);
  const selectedColors = kindColors(selectedKind);
  const uniqueDates = Array.from(new Set([...noteDates, today])).sort();

  return (
    <View style={styles.wrap}>
      <View style={styles.navRow}>
        <TouchableOpacity
          style={styles.arrowBtn}
          onPress={() => onSelectDate(shiftDateKey(selectedDate, -1))}
          accessibilityLabel="전날"
        >
          <Text style={styles.arrowText}>‹</Text>
        </TouchableOpacity>

        <View
          style={[
            styles.dateBox,
            { backgroundColor: selectedColors.bg, borderColor: selectedColors.border },
          ]}
        >
          <Text style={[styles.dateText, { color: selectedColors.fg }]}>
            {formatDateKeyKorean(selectedDate)}
          </Text>
          <Text style={[styles.kindText, { color: selectedColors.fg }]}>
            {DATE_KIND_LABEL[selectedKind]}
          </Text>
        </View>

        <TouchableOpacity
          style={styles.arrowBtn}
          onPress={() => onSelectDate(shiftDateKey(selectedDate, 1))}
          accessibilityLabel="다음날"
        >
          <Text style={styles.arrowText}>›</Text>
        </TouchableOpacity>

        {selectedKind !== 'today' && (
          <TouchableOpacity style={styles.todayBtn} onPress={() => onSelectDate(today)}>
            <Text style={styles.todayBtnText}>오늘</Text>
          </TouchableOpacity>
        )}
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipRow}>
        {uniqueDates.map((d) => {
          const c = kindColors(getDateKind(d, today));
          const active = d === selectedDate;
          return (
            <TouchableOpacity
              key={d}
              onPress={() => onSelectDate(d)}
              style={[
                styles.chip,
                { backgroundColor: active ? c.fg : c.bg, borderColor: c.border },
              ]}
            >
              <Text style={[styles.chipText, { color: active ? COLORS.background : c.fg }]}>
                {d.slice(5).replace('-', '/')}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  wrap: { marginBottom: 16 },
  navRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10 },
  arrowBtn: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  arrowText: { fontSize: 26, fontWeight: '700', color: COLORS.textSecondary },
  dateBox: {
    flex: 1,
    minHeight: 44,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 12,
  },
  dateText: { fontSize: 15, fontWeight: '800' },
  kindText: { fontSize: 11, fontWeight: '700' },
  todayBtn: {
    minHeight: 44,
    paddingHorizontal: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  todayBtnText: { fontSize: 13, fontWeight: '700', color: COLORS.textSecondary },
  chipRow: { gap: 6, paddingVertical: 2 },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 999,
    borderWidth: 1,
  },
  chipText: { fontSize: 12, fontWeight: '700' },
});
