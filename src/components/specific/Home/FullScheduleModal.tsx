import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  PanResponder,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { COLORS, useAppTheme } from '../../../constants/theme';
import { useShiftScheduleStore } from '../../../store/useShiftScheduleStore';
import { useUserStore } from '../../../store/useUserStore';
import { nativeCalendarService } from '../../../services/nativeCalendarService';
import { SwipeableBottomSheet } from '../../common/SwipeableBottomSheet';

interface FullScheduleModalProps {
  visible: boolean;
  onClose: () => void;
  onOpenAddSchedule?: () => void;
}

export const FullScheduleModal: React.FC<FullScheduleModalProps> = ({
  visible,
  onClose,
  onOpenAddSchedule,
}) => {
  const theme = useAppTheme();
  const { currentDate, schedules, customCodes, changeMonth } = useShiftScheduleStore();
  const userId = useUserStore((s) => s.id);
  const today = new Date();
  const defaultDateStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
  const [selectedDateStr, setSelectedDateStr] = useState<string | null>(defaultDateStr);
  const [isSyncing, setIsSyncing] = useState(false);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth(); // 0-indexed

  const handleSyncNativeCalendar = async () => {
    setIsSyncing(true);
    const targetYm = `${year}-${String(month + 1).padStart(2, '0')}`;
    const res = await nativeCalendarService.syncDutyScheduleToNativeCalendar(schedules, targetYm);
    setIsSyncing(false);
    Alert.alert(res.success ? '캘린더 동기화 완료 🗓️' : '동기화 알림', res.message);
  };

  const firstDayIndex = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const daysOfWeek = ['일', '월', '화', '수', '목', '금', '토'];

  // 월간 통계 계산 (D, E, N, O 등)
  const dutyCounts: Record<string, number> = { D: 0, E: 0, N: 0, O: 0, V: 0 };
  for (let day = 1; day <= daysInMonth; day++) {
    const monthStr = String(month + 1).padStart(2, '0');
    const dayStr = String(day).padStart(2, '0');
    const dateKey = `${year}-${monthStr}-${dayStr}`;
    const code = schedules[dateKey];
    if (code) {
      dutyCounts[code] = (dutyCounts[code] || 0) + 1;
    }
  }

  // 복수 오프(isOff: true 또는 O, /, OFF 등) 통계 합산
  const totalOffCount = Object.entries(dutyCounts).reduce((acc, [code, count]) => {
    const shift = customCodes[code];
    if (shift?.isOff || code === 'O' || shift?.name?.includes('오프') || shift?.name?.includes('휴')) {
      return acc + count;
    }
    return acc;
  }, 0);

  // 간단한 좌우 스와이프 감지 PanResponder
  const panResponder = PanResponder.create({
    onMoveShouldSetPanResponder: (_, gestureState) => Math.abs(gestureState.dx) > 30,
    onPanResponderRelease: (_, gestureState) => {
      if (gestureState.dx > 50) {
        // 오른쪽 스와이프: 이전 달
        changeMonth(-1, userId || undefined);
      } else if (gestureState.dx < -50) {
        // 왼쪽 스와이프: 다음 달
        changeMonth(1, userId || undefined);
      }
    },
  });

  const renderDays = () => {
    const cells = [];
    // 이전 달 빈칸 패딩
    for (let i = 0; i < firstDayIndex; i++) {
      cells.push(<View key={`empty-${i}`} style={styles.dayCellEmpty} />);
    }

    // 당월 날짜들
    for (let day = 1; day <= daysInMonth; day++) {
      const monthStr = String(month + 1).padStart(2, '0');
      const dayStr = String(day).padStart(2, '0');
      const dateKey = `${year}-${monthStr}-${dayStr}`;
      const code = schedules[dateKey];
      const shiftInfo = code ? customCodes[code] || { code, name: code, color: COLORS.primary, textColor: '#FFF' } : null;
      const isSelected = selectedDateStr === dateKey;
      const isToday = dateKey === defaultDateStr;
      const dayOfWeek = (firstDayIndex + day - 1) % 7;

      cells.push(
        <TouchableOpacity
          key={dateKey}
          style={[styles.dayCell, isSelected && styles.dayCellSelected]}
          onPress={() => setSelectedDateStr(dateKey)}
          activeOpacity={0.7}
        >
          <View style={[styles.dateHeaderRow, isToday && { backgroundColor: theme.primary }]}>
            <Text
              style={[
                styles.dayNumberText,
                dayOfWeek === 0 ? styles.sundayText : dayOfWeek === 6 ? styles.saturdayText : null,
                isToday && [styles.todayNumberText, { color: theme.onPrimaryText }],
              ]}
            >
              {day}
            </Text>
          </View>

          {shiftInfo ? (
            <View style={[styles.shiftBlock, { backgroundColor: shiftInfo.color }]}>
              <Text style={[styles.shiftBlockText, { color: shiftInfo.textColor || '#FFFFFF' }]}>
                {shiftInfo.code === 'O' ? '🛏️' : shiftInfo.code}
              </Text>
            </View>
          ) : (
            <View style={styles.emptyShiftBlock} />
          )}
        </TouchableOpacity>
      );
    }

    return cells;
  };

  const selectedShiftCode = selectedDateStr ? schedules[selectedDateStr] : null;
  const selectedShiftInfo = selectedShiftCode ? customCodes[selectedShiftCode] : null;

  return (
    <SwipeableBottomSheet visible={visible} onClose={onClose} height="92%">
      {/* 헤더 */}
      <View style={styles.header}>
            <Text style={styles.headerTitle}>전체 스케줄 (월간 캘린더)</Text>
            <TouchableOpacity onPress={onClose} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
              <Text style={styles.closeText}>닫기</Text>
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
            {/* ── 월 네비게이션 ── */}
            <View style={styles.monthNavRow}>
              <TouchableOpacity
                style={styles.monthNavBtn}
                onPress={() => changeMonth(-1, userId || undefined)}
                activeOpacity={0.7}
              >
                <Text style={styles.monthNavArrow}>‹</Text>
              </TouchableOpacity>

              <View style={styles.monthTitleWrapper}>
                <Text style={styles.monthTitleText}>
                  {year}년 {month + 1}월
                </Text>
                <Text style={styles.monthSwipeHint}>좌우로 스와이프하여 달 이동</Text>
              </View>

              <TouchableOpacity
                style={styles.monthNavBtn}
                onPress={() => changeMonth(1, userId || undefined)}
                activeOpacity={0.7}
              >
                <Text style={styles.monthNavArrow}>›</Text>
              </TouchableOpacity>
            </View>

            {/* ── 상단 듀티 통계 바 (마이듀티 레퍼런스 스타일) ── */}
            <View style={styles.topSummaryBar}>
              <View style={[styles.topSummaryBadge, { backgroundColor: customCodes.D?.color || '#4F98CA' }]}>
                <Text style={styles.topSummaryBadgeText}>D {dutyCounts.D || 0}</Text>
              </View>
              <View style={[styles.topSummaryBadge, { backgroundColor: customCodes.E?.color || '#E2703A' }]}>
                <Text style={styles.topSummaryBadgeText}>E {dutyCounts.E || 0}</Text>
              </View>
              <View style={[styles.topSummaryBadge, { backgroundColor: customCodes.N?.color || '#272727' }]}>
                <Text style={styles.topSummaryBadgeText}>N {dutyCounts.N || 0}</Text>
              </View>
              <View style={[styles.topSummaryBadge, { backgroundColor: customCodes.O?.color || '#E84A5F' }]}>
                <Text style={styles.topSummaryBadgeText}>🛏️ {totalOffCount}</Text>
              </View>
              {(dutyCounts.V || 0) > 0 && (
                <View style={[styles.topSummaryBadge, { backgroundColor: customCodes.V?.color || '#9B51E0' }]}>
                  <Text style={styles.topSummaryBadgeText}>V {dutyCounts.V}</Text>
                </View>
              )}
            </View>

            {/* ── 요일 헤더 ── */}
            <View style={styles.weekHeader}>
              {daysOfWeek.map((d, idx) => (
                <Text
                  key={d}
                  style={[
                    styles.weekHeaderText,
                    idx === 0 ? styles.sundayText : idx === 6 ? styles.saturdayText : null,
                  ]}
                >
                  {d}
                </Text>
              ))}
            </View>

            {/* ── 날짜 그리드 ── */}
            <View style={styles.calendarGrid}>{renderDays()}</View>

            {/* ── 선택 날짜 상세 카드 ── */}
            {selectedDateStr && (
              <View style={styles.selectedDetailCard}>
                <View style={styles.selectedDetailLeft}>
                  <Text style={styles.selectedDetailDate}>{selectedDateStr}</Text>
                  <Text style={styles.selectedDetailShift}>
                    근무:{' '}
                    {selectedShiftInfo
                      ? `${selectedShiftInfo.name} (${selectedShiftInfo.code})`
                      : '지정된 근무 없음'}
                  </Text>
                </View>

                {onOpenAddSchedule && (
                  <TouchableOpacity
                    style={[styles.editDateBtn, { backgroundColor: theme.primary }]}
                    onPress={() => {
                      onClose();
                      onOpenAddSchedule();
                    }}
                    activeOpacity={0.8}
                  >
                    <Text style={[styles.editDateBtnText, { color: theme.onPrimaryText }]}>스케줄 수정 ›</Text>
                  </TouchableOpacity>
                )}
              </View>
            )}

            {/* ── 월간 듀티 통계 요약 카드 ── */}
            <View style={styles.statsCard}>
              <Text style={styles.statsTitle}>{month + 1}월 듀티 총합</Text>
              <View style={styles.statsRow}>
                <View style={styles.statBox}>
                  <View style={[styles.statDot, { backgroundColor: customCodes.D?.color || '#4F98CA' }]} />
                  <Text style={styles.statLabel}>Day</Text>
                  <Text style={styles.statValue}>{dutyCounts.D || 0}일</Text>
                </View>

                <View style={styles.statBox}>
                  <View style={[styles.statDot, { backgroundColor: customCodes.E?.color || '#E2703A' }]} />
                  <Text style={styles.statLabel}>Eve</Text>
                  <Text style={styles.statValue}>{dutyCounts.E || 0}일</Text>
                </View>

                <View style={styles.statBox}>
                  <View style={[styles.statDot, { backgroundColor: customCodes.N?.color || '#272727' }]} />
                  <Text style={styles.statLabel}>Night</Text>
                  <Text style={styles.statValue}>{dutyCounts.N || 0}일</Text>
                </View>

                <View style={styles.statBox}>
                  <View style={[styles.statDot, { backgroundColor: customCodes.O?.color || '#E84A5F' }]} />
                  <Text style={styles.statLabel}>Off</Text>
                  <Text style={styles.statValue}>{totalOffCount}일</Text>
                </View>
              </View>
            </View>

            {/* ── 휴대폰 기본 캘린더 동기화 액션 버튼 ── */}
            <TouchableOpacity
              style={[
                styles.calendarSyncActionBtn,
                { backgroundColor: theme.primaryTint, borderColor: theme.primaryLight },
              ]}
              onPress={handleSyncNativeCalendar}
              disabled={isSyncing}
              activeOpacity={0.85}
            >
              {isSyncing ? (
                <ActivityIndicator color={theme.primary} size="small" />
              ) : (
                <Text style={[styles.calendarSyncActionText, { color: theme.primary }]}>
                  🗓️ 휴대폰 기본 캘린더(iOS/Android)로 내보내기
                </Text>
              )}
            </TouchableOpacity>
          </ScrollView>
    </SwipeableBottomSheet>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    maxHeight: '92%',
    paddingBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 10,
  },
  handleBar: {
    width: 40,
    height: 4,
    backgroundColor: '#E5E7EB',
    borderRadius: 2,
    alignSelf: 'center',
    marginTop: 10,
    marginBottom: 8,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  closeText: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.textMuted,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 30,
  },
  monthNavRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
    paddingHorizontal: 8,
  },
  monthNavBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  monthNavArrow: {
    fontSize: 20,
    fontWeight: '600',
    color: COLORS.textPrimary,
    lineHeight: 22,
  },
  monthTitleWrapper: {
    alignItems: 'center',
  },
  monthTitleText: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.textPrimary,
    letterSpacing: -0.5,
  },
  monthSwipeHint: {
    fontSize: 11,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  topSummaryBar: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 10,
    paddingHorizontal: 8,
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#EEF2F6',
  },
  topSummaryBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    minWidth: 48,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 1,
  },
  topSummaryBadgeText: {
    fontSize: 12,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  weekHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    backgroundColor: '#F9FAFB',
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  weekHeaderText: {
    flex: 1,
    textAlign: 'center',
    fontSize: 13,
    fontWeight: '800',
    color: COLORS.textSecondary,
  },
  sundayText: {
    color: '#EF4444',
  },
  saturdayText: {
    color: '#3B82F6',
  },
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#E5E7EB',
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#FFFFFF',
    marginBottom: 8,
  },
  dayCell: {
    width: '14.285%',
    minHeight: 64,
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingVertical: 5,
    paddingHorizontal: 2,
    borderRightWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#F3F4F6',
    backgroundColor: '#FFFFFF',
  },
  dayCellEmpty: {
    width: '14.285%',
    minHeight: 64,
    borderRightWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#F3F4F6',
    backgroundColor: '#FAFAFA',
  },
  dayCellSelected: {
    backgroundColor: '#FFF0F3',
  },
  dateHeaderRow: {
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: 8,
    marginBottom: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  todayHeaderBg: {
    backgroundColor: COLORS.primary,
  },
  dayNumberText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  todayNumberText: {
    color: '#FFFFFF',
    fontWeight: '800',
  },
  shiftBlock: {
    width: '92%',
    height: 30,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1.5,
    elevation: 1,
  },
  shiftBlockText: {
    fontSize: 14,
    fontWeight: '900',
    letterSpacing: -0.2,
  },
  emptyShiftBlock: {
    height: 30,
    marginTop: 2,
  },
  selectedDetailCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FAFAFA',
    borderRadius: 14,
    padding: 14,
    marginTop: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  selectedDetailLeft: {
    gap: 2,
  },
  selectedDetailDate: {
    fontSize: 12,
    color: COLORS.textMuted,
    fontWeight: '600',
  },
  selectedDetailShift: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  editDateBtn: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: COLORS.primary,
  },
  editDateBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  statsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginTop: 14,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  statsTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 12,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statBox: {
    alignItems: 'center',
    gap: 4,
  },
  statDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statLabel: {
    fontSize: 11,
    color: COLORS.textSecondary,
    fontWeight: '600',
  },
  statValue: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  calendarSyncActionBtn: {
    backgroundColor: '#FFF1F4',
    borderWidth: 1,
    borderColor: '#FFE4EA',
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 14,
    marginBottom: 8,
  },
  calendarSyncActionText: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.primary,
  },
});

export default FullScheduleModal;

