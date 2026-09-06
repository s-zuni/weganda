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
import { COLORS } from '../../../constants/theme';
import { useShiftScheduleStore } from '../../../store/useShiftScheduleStore';
import { nativeCalendarService } from '../../../services/nativeCalendarService';

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
  const { currentDate, schedules, customCodes, changeMonth } = useShiftScheduleStore();
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

  // 간단한 좌우 스와이프 감지 PanResponder
  const panResponder = PanResponder.create({
    onMoveShouldSetPanResponder: (_, gestureState) => Math.abs(gestureState.dx) > 30,
    onPanResponderRelease: (_, gestureState) => {
      if (gestureState.dx > 50) {
        // 오른쪽 스와이프: 이전 달
        changeMonth(-1);
      } else if (gestureState.dx < -50) {
        // 왼쪽 스와이프: 다음 달
        changeMonth(1);
      }
    },
  });

  const renderDays = () => {
    const cells = [];
    // 이전 달 빈칸 패딩
    for (let i = 0; i < firstDayIndex; i++) {
      cells.push(<View key={`empty-${i}`} style={styles.dayCell} />);
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

      cells.push(
        <TouchableOpacity
          key={dateKey}
          style={[styles.dayCell, isSelected && styles.dayCellSelected]}
          onPress={() => setSelectedDateStr(dateKey)}
          activeOpacity={0.7}
        >
          <View style={[styles.dateCircle, isToday && styles.todayDateCircle]}>
            <Text style={[styles.dayNumberText, isToday && styles.todayNumberText]}>
              {day}
            </Text>
          </View>

          {shiftInfo ? (
            <View style={[styles.shiftBadge, { backgroundColor: shiftInfo.color }]}>
              <Text style={[styles.shiftBadgeText, { color: shiftInfo.textColor }]}>
                {shiftInfo.code}
              </Text>
            </View>
          ) : (
            <View style={styles.emptyShiftSpace} />
          )}
        </TouchableOpacity>
      );
    }

    return cells;
  };

  const selectedShiftCode = selectedDateStr ? schedules[selectedDateStr] : null;
  const selectedShiftInfo = selectedShiftCode ? customCodes[selectedShiftCode] : null;

  return (
    <Modal visible={visible} animationType="slide" transparent={true} onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.modalContainer} {...panResponder.panHandlers}>
          {/* 핸들바 */}
          <View style={styles.handleBar} />

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
                onPress={() => changeMonth(-1)}
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
                onPress={() => changeMonth(1)}
                activeOpacity={0.7}
              >
                <Text style={styles.monthNavArrow}>›</Text>
              </TouchableOpacity>
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
                    style={styles.editDateBtn}
                    onPress={() => {
                      onClose();
                      onOpenAddSchedule();
                    }}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.editDateBtnText}>스케줄 수정 ›</Text>
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
                  <Text style={styles.statValue}>{(dutyCounts.O || 0) + (dutyCounts.F || 0)}일</Text>
                </View>
              </View>
            </View>

            {/* ── 휴대폰 기본 캘린더 동기화 액션 버튼 ── */}
            <TouchableOpacity
              style={styles.calendarSyncActionBtn}
              onPress={handleSyncNativeCalendar}
              disabled={isSyncing}
              activeOpacity={0.85}
            >
              {isSyncing ? (
                <ActivityIndicator color="#FFFFFF" size="small" />
              ) : (
                <Text style={styles.calendarSyncActionText}>
                  🗓️ 휴대폰 기본 캘린더(iOS/Android)로 내보내기
                </Text>
              )}
            </TouchableOpacity>
          </ScrollView>
        </View>
      </View>
    </Modal>
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
  weekHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
    marginBottom: 6,
  },
  weekHeaderText: {
    flex: 1,
    textAlign: 'center',
    fontSize: 13,
    fontWeight: '700',
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
  },
  dayCell: {
    width: '14.28%',
    aspectRatio: 0.9,
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingVertical: 4,
    borderRadius: 10,
  },
  dayCellSelected: {
    backgroundColor: 'rgba(255, 80, 124, 0.08)',
  },
  dateCircle: {
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  todayDateCircle: {
    backgroundColor: COLORS.primary,
  },
  dayNumberText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  todayNumberText: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  shiftBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    minWidth: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  shiftBadgeText: {
    fontSize: 10,
    fontWeight: '800',
  },
  emptyShiftSpace: {
    height: 18,
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

