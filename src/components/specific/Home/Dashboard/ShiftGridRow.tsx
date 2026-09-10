import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { COLORS, useAppTheme } from '../../../../constants/theme';
import { ClockIcon, FortuneIcon } from '../../../common/Icon';
import { ShiftInfo } from '../../../../types/shift';

interface ShiftGridRowProps {
  today: Date;
  tomorrow: Date;
  todayShift: string | null;
  tomorrowShift: string | null;
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
  const theme = useAppTheme();
  return (
    <View style={styles.shiftGridRow}>
      {/* 1. 오늘 근무 컬럼 (테마 톤) */}
      <View style={styles.shiftCol}>
        <View style={[
          styles.todayCard,
          {
            backgroundColor: theme.primaryTint,
            borderColor: theme.primaryMuted,
            shadowColor: theme.primary,
          },
        ]}>
          <View style={[styles.todayDateBadge, { backgroundColor: theme.primaryLight + '25' }]}>
            <Text style={[styles.todayDateLabel, { color: theme.primary }]}>
              오늘 ({today.getMonth() + 1}/{today.getDate()}) 근무
            </Text>
          </View>
          <View style={styles.codeRow}>
            <View style={styles.shiftCodeHeaderRow}>
              <Text
                style={[
                  styles.cardShiftCode,
                  todayShiftInfo && { color: todayShiftInfo.color },
                  !todayShift && { color: COLORS.textMuted },
                ]}
              >
                {todayShift || '-'}
              </Text>
              {todayShiftInfo && (
                <View
                  style={[
                    styles.shiftNamePill,
                    { backgroundColor: todayShiftInfo.color + '18' },
                  ]}
                >
                  <Text
                    style={[
                      styles.shiftNamePillText,
                      { color: todayShiftInfo.color },
                    ]}
                  >
                    {todayShiftInfo.shortName}
                  </Text>
                </View>
              )}
            </View>
            <Text style={styles.cardTimeText} numberOfLines={1}>
              {todayShiftInfo?.defaultStartTime && todayShiftInfo?.defaultEndTime
                ? `${todayShiftInfo.defaultStartTime} - ${todayShiftInfo.defaultEndTime}`
                : todayShift === 'O' || todayShift === 'V'
                ? '오늘 편안한 휴무!'
                : '스케줄 미등록'}
            </Text>
          </View>
        </View>
        <TouchableOpacity
          style={[styles.todayActionBtn, { backgroundColor: theme.primary, shadowColor: theme.primary }]}
          onPress={onOpenAlarmModal}
          activeOpacity={0.8}
        >
          <View style={styles.subActionInner}>
            <ClockIcon size={14} color={theme.onPrimaryText} />
            <Text style={[styles.todayActionText, { color: theme.onPrimaryText }]}>알람 맞추기</Text>
          </View>
        </TouchableOpacity>
      </View>

      {/* 2. 내일 근무 컬럼 (웜 베이지 톤) */}
      <View style={styles.shiftCol}>
        <View style={styles.tomorrowCard}>
          <View style={styles.tomorrowDateBadge}>
            <Text style={styles.tomorrowDateLabel}>
              내일 ({tomorrow.getMonth() + 1}/{tomorrow.getDate()}) 근무
            </Text>
          </View>
          <View style={styles.codeRow}>
            <View style={styles.shiftCodeHeaderRow}>
              <Text
                style={[
                  styles.cardShiftCode,
                  tomorrowShiftInfo && { color: tomorrowShiftInfo.color },
                  !tomorrowShift && { color: COLORS.subBeigeMuted },
                ]}
              >
                {tomorrowShift || '-'}
              </Text>
              {tomorrowShiftInfo && (
                <View
                  style={[
                    styles.shiftNamePill,
                    { backgroundColor: tomorrowShiftInfo.color + '18' },
                  ]}
                >
                  <Text
                    style={[
                      styles.shiftNamePillText,
                      { color: tomorrowShiftInfo.color },
                    ]}
                  >
                    {tomorrowShiftInfo.shortName}
                  </Text>
                </View>
              )}
            </View>
            <View style={styles.tomorrowTextGroup}>
              <Text style={styles.tomorrowSubText} numberOfLines={1}>
                {tomorrowShift === 'O' || tomorrowShift === 'V'
                  ? '내일은 꿀휴무!'
                  : tomorrowShiftInfo
                  ? `${tomorrowShiftInfo.shortName} 근무 예정`
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
                      : '🗓️ 캘린더 동기화 +')}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
        <TouchableOpacity
          style={styles.tomorrowActionBtn}
          onPress={onNavigateFortune}
          activeOpacity={0.8}
        >
          <View style={styles.subActionInner}>
            <FortuneIcon size={14} color="#FFFFFF" />
            <Text style={styles.tomorrowActionText}>오늘의 운세</Text>
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
  // ── 오늘 카드: 코랄 핑크 틴트 + 핑크 테두리 ──
  todayCard: {
    backgroundColor: '#FFF1F4',
    borderRadius: 18,
    padding: 16,
    minHeight: 156,
    justifyContent: 'space-between',
    borderWidth: 1.5,
    borderColor: '#FFCCD6',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 3,
  },
  todayDateBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#FFE4EA',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  todayDateLabel: {
    fontSize: 13,
    color: COLORS.primary,
    fontWeight: '800',
  },
  // ── 내일 카드: 웜 오트밀 베이지 + 베이지 테두리 ──
  tomorrowCard: {
    backgroundColor: COLORS.subBeige,
    borderRadius: 18,
    padding: 16,
    minHeight: 156,
    justifyContent: 'space-between',
    borderWidth: 1.5,
    borderColor: COLORS.subBeigeBorder,
    shadowColor: '#5A4A3E',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
  },
  tomorrowDateBadge: {
    alignSelf: 'flex-start',
    backgroundColor: COLORS.subBeigeBadge,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  tomorrowDateLabel: {
    fontSize: 13,
    color: COLORS.subBeigeText,
    fontWeight: '800',
  },
  codeRow: {
    alignItems: 'flex-start',
    width: '100%',
  },
  shiftCodeHeaderRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 8,
    marginBottom: 4,
  },
  cardShiftCode: {
    fontSize: 48,
    fontWeight: '900',
    lineHeight: 52,
    letterSpacing: -1,
  },
  shiftNamePill: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  shiftNamePillText: {
    fontSize: 12,
    fontWeight: '800',
  },
  cardTimeText: {
    fontSize: 14,
    color: '#374151',
    fontWeight: '700',
  },
  tomorrowTextGroup: {
    gap: 4,
    width: '100%',
  },
  tomorrowSubText: {
    fontSize: 14,
    color: COLORS.subBeigeText,
    fontWeight: '700',
  },
  calendarSyncBadge: {
    backgroundColor: COLORS.subBeigeBadge,
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
    alignSelf: 'flex-start',
    maxWidth: '100%',
  },
  calendarSyncText: {
    fontSize: 12,
    color: COLORS.subBeigeText,
    fontWeight: '700',
  },
  // ── 버튼 스타일 분리 ──
  todayActionBtn: {
    backgroundColor: COLORS.primary,
    borderRadius: 14,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  todayActionText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  tomorrowActionBtn: {
    backgroundColor: COLORS.subBeigeBtn,
    borderRadius: 14,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: COLORS.subBeigeBtn,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 2,
  },
  tomorrowActionText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  subActionInner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
});

