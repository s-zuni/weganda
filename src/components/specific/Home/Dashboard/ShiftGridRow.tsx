import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { COLORS } from '../../../../constants/theme';
import { ClockIcon, FortuneIcon } from '../../../common/Icon';
import { ShiftCode, ShiftInfo } from '../../../../types/shift';

interface ShiftGridRowProps {
  today: Date;
  tomorrow: Date;
  todayShift: ShiftCode | null;
  tomorrowShift: ShiftCode | null;
  todayShiftInfo: ShiftInfo | null;
  tomorrowShiftInfo: ShiftInfo | null;
  tomorrowCalendarEvent: string;
  onOpenAlarmModal: () => void;
  onQuickSyncCalendar: () => void;
  onNavigateFortune: () => void;
}

export const ShiftGridRow: React.FC<ShiftGridRowProps> = ({
  today,
  tomorrow,
  todayShift,
  tomorrowShift,
  todayShiftInfo,
  tomorrowShiftInfo,
  tomorrowCalendarEvent,
  onOpenAlarmModal,
  onQuickSyncCalendar,
  onNavigateFortune,
}) => {
  return (
    <View style={styles.shiftGridRow}>
      {/* 오늘 근무 컬럼 */}
      <View style={styles.shiftCol}>
        <View style={styles.todayCard}>
          <Text style={styles.cardDateLabel}>
            오늘 ({today.getMonth() + 1}/{today.getDate()}) 근무
          </Text>
          <View style={styles.codeRow}>
            <Text
              style={[
                styles.cardShiftCode,
                todayShiftInfo && { color: todayShiftInfo.color },
                !todayShift && { color: COLORS.textMuted },
              ]}
            >
              {todayShift || '-'}
            </Text>
            <Text style={styles.cardTimeText}>
              {todayShiftInfo?.defaultStartTime && todayShiftInfo?.defaultEndTime
                ? `${todayShiftInfo.defaultStartTime} - ${todayShiftInfo.defaultEndTime}`
                : todayShift === 'O' || todayShift === 'V'
                ? '휴무'
                : '스케줄 미등록'}
            </Text>
          </View>
        </View>
        <TouchableOpacity
          style={styles.subActionBtn}
          onPress={onOpenAlarmModal}
          activeOpacity={0.8}
        >
          <View style={styles.subActionInner}>
            <ClockIcon size={14} color="#FFFFFF" />
            <Text style={styles.subActionText}>알람 맞추기</Text>
          </View>
        </TouchableOpacity>
      </View>

      {/* 내일 근무 컬럼 */}
      <View style={styles.shiftCol}>
        <View style={styles.tomorrowCard}>
          <Text style={styles.cardDateLabel}>
            내일 ({tomorrow.getMonth() + 1}/{tomorrow.getDate()}) 근무
          </Text>
          <View style={styles.codeRow}>
            <Text
              style={[
                styles.cardShiftCode,
                tomorrowShiftInfo && { color: tomorrowShiftInfo.color },
                !tomorrowShift && { color: COLORS.textMuted },
              ]}
            >
              {tomorrowShift || '-'}
            </Text>
            <View style={styles.tomorrowTextGroup}>
              <Text style={styles.tomorrowSubText}>
                {tomorrowShift === 'O' || tomorrowShift === 'V'
                  ? '내일은 쉬는 날!'
                  : tomorrowShiftInfo
                  ? `${tomorrowShiftInfo.shortName} 근무`
                  : '일정 없음'}
              </Text>
              <TouchableOpacity
                style={styles.calendarSyncBadge}
                onPress={onQuickSyncCalendar}
                activeOpacity={0.8}
              >
                <Text style={styles.calendarSyncText} numberOfLines={1}>
                  {tomorrowCalendarEvent ||
                    (tomorrowShiftInfo?.defaultStartTime && tomorrowShiftInfo?.defaultEndTime
                      ? `🗓️ ${tomorrowShiftInfo.defaultStartTime} - ${tomorrowShiftInfo.defaultEndTime}`
                      : '🗓️ 캘린더 동기화하기 +')}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
        <TouchableOpacity
          style={styles.subActionBtn}
          onPress={onNavigateFortune}
          activeOpacity={0.8}
        >
          <View style={styles.subActionInner}>
            <FortuneIcon size={14} color="#FFFFFF" />
            <Text style={styles.subActionText}>오늘의 운세</Text>
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  shiftGridRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  shiftCol: {
    flex: 1,
    gap: 8,
  },
  todayCard: {
    backgroundColor: COLORS.primary,
    borderRadius: 18,
    padding: 16,
    minHeight: 146,
    justifyContent: 'space-between',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  tomorrowCard: {
    backgroundColor: COLORS.primaryLight,
    borderRadius: 18,
    padding: 16,
    minHeight: 146,
    justifyContent: 'space-between',
    shadowColor: COLORS.primaryLight,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18,
    shadowRadius: 8,
    elevation: 4,
  },
  cardDateLabel: {
    fontSize: 13,
    color: '#FFFFFF',
    fontWeight: '700',
  },
  codeRow: {
    alignItems: 'flex-start',
  },
  cardShiftCode: {
    fontSize: 44,
    fontWeight: '800',
    color: '#FFFFFF',
    lineHeight: 48,
    letterSpacing: -1,
  },
  cardTimeText: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.9)',
    marginTop: 2,
    fontWeight: '500',
  },
  tomorrowTextGroup: {
    marginTop: 2,
    gap: 3,
    width: '100%',
  },
  tomorrowSubText: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.95)',
    fontWeight: '700',
  },
  calendarSyncBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.28)',
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
    alignSelf: 'flex-start',
    maxWidth: '100%',
  },
  calendarSyncText: {
    fontSize: 10,
    color: '#FFFFFF',
    fontWeight: '700',
  },
  subActionBtn: {
    backgroundColor: COLORS.primaryMuted,
    borderRadius: 14,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  subActionInner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  subActionText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
});

