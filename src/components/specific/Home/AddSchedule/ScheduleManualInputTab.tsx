import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { COLORS } from '../../../../constants/theme';
import { CustomShiftCode } from '../../../../types/shift';

interface ScheduleManualInputTabProps {
  month: number;
  year: number;
  daysInMonth: number;
  selectedDay: number;
  schedules: Record<string, string>;
  customCodes: Record<string, CustomShiftCode>;
  onSelectDay: (day: number) => void;
  onAssignShift: (code: string) => void;
}

export const ScheduleManualInputTab: React.FC<ScheduleManualInputTabProps> = ({
  month,
  year,
  daysInMonth,
  selectedDay,
  schedules,
  customCodes,
  onSelectDay,
  onAssignShift,
}) => {
  return (
    <View>
      <Text style={styles.tabDesc}>
        날짜를 선택한 후, 아래 근무 코드 버튼을 터치하여 빠르게 입력하세요.
      </Text>

      {/* 날짜 가로 휠/스크롤 */}
      <Text style={styles.subSectionTitle}>날짜 선택 ({month + 1}월)</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.dayPickerScroll}
      >
        {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((d) => {
          const isSelected = selectedDay === d;
          const dStr = String(d).padStart(2, '0');
          const mStr = String(month + 1).padStart(2, '0');
          const currentCode = schedules[`${year}-${mStr}-${dStr}`];
          return (
            <TouchableOpacity
              key={d}
              style={[styles.dayPickerChip, isSelected && styles.dayPickerChipSelected]}
              onPress={() => onSelectDay(d)}
            >
              <Text
                style={[
                  styles.dayPickerText,
                  isSelected && styles.dayPickerTextSelected,
                ]}
              >
                {d}일
              </Text>
              <Text
                style={[
                  styles.dayPickerCode,
                  isSelected && styles.dayPickerCodeSelected,
                  currentCode
                    ? { color: customCodes[currentCode]?.color || COLORS.primary }
                    : null,
                ]}
              >
                {currentCode || '-'}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* 듀티 코드 선택기 */}
      <Text style={styles.subSectionTitle}>
        {selectedDay}일 근무 지정 (터치 시 자동 입력)
      </Text>
      <View style={styles.codeButtonGrid}>
        {Object.values(customCodes).map((item) => (
          <TouchableOpacity
            key={item.code}
            style={[styles.dutySelectBtn, { borderColor: item.color }]}
            onPress={() => onAssignShift(item.code)}
            activeOpacity={0.8}
          >
            <View style={[styles.dutyBadgeCircle, { backgroundColor: item.color }]}>
              <Text style={[styles.dutyBadgeText, { color: item.textColor }]}>
                {item.code}
              </Text>
            </View>
            <Text style={styles.dutyNameText}>{item.name}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.hintNotice}>
        💡 한 번 스케줄을 지정했더라도 언제든 터치하여 변경하거나 수정할 수 있습니다.
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  tabDesc: {
    fontSize: 13,
    color: COLORS.textMuted,
    lineHeight: 19,
    marginBottom: 16,
  },
  subSectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 10,
    marginTop: 8,
  },
  dayPickerScroll: {
    marginBottom: 20,
  },
  dayPickerChip: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    marginRight: 8,
    minWidth: 50,
  },
  dayPickerChipSelected: {
    backgroundColor: COLORS.primary,
  },
  dayPickerText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  dayPickerTextSelected: {
    color: '#FFFFFF',
  },
  dayPickerCode: {
    fontSize: 14,
    fontWeight: '800',
    marginTop: 4,
    color: COLORS.textMuted,
  },
  dayPickerCodeSelected: {
    color: '#FFFFFF',
  },
  codeButtonGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 16,
  },
  dutySelectBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderWidth: 1.5,
    gap: 8,
    minWidth: '45%',
    flex: 1,
  },
  dutyBadgeCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dutyBadgeText: {
    fontSize: 13,
    fontWeight: '800',
  },
  dutyNameText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  hintNotice: {
    fontSize: 12,
    color: COLORS.textMuted,
    lineHeight: 18,
    marginTop: 8,
  },
});
