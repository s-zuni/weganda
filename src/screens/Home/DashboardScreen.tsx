import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Alert,
} from 'react-native';
import { AppHeader } from '../../components/common/AppHeader';
import { COLORS } from '../../constants/theme';
import {
  ClockIcon,
  FortuneIcon,
  PencilIcon,
  BriefcaseIcon,
} from '../../components/common/Icon';
import { ShiftCode, SHIFT_TYPES } from '../../constants/shiftTypes';
import { useUserStore } from '../../store/useUserStore';
import { useShiftScheduleStore } from '../../store/useShiftScheduleStore';
import { nativeCalendarService } from '../../services/nativeCalendarService';

// 분리된 서브 모달 컴포넌트들
import {
  ClinicalAlarmModal,
  FullScheduleModal,
  AddScheduleModal,
  DailyNoteModal,
} from '../../components/specific/Home';

export const DashboardScreen: React.FC<{ navigation?: any }> = ({ navigation }) => {
  const user = useUserStore((s) => ({ id: s.id, name: s.name, nickname: s.nickname }));
  const displayName = user.nickname || user.name || '간호사';
  const { schedules, fetchMonthlySchedule } = useShiftScheduleStore();

  const [tomorrowCalendarEvent, setTomorrowCalendarEvent] = useState<string>('');
  const [isSyncingCalendar, setIsSyncingCalendar] = useState(false);

  useEffect(() => {
    if (user.id) {
      fetchMonthlySchedule(user.id);
    }
    // 스마트폰 기본 캘린더의 내일 개인 일정 읽어오기
    nativeCalendarService.getTomorrowNativeEvents().then((res) => {
      if (res.hasEvents) {
        setTomorrowCalendarEvent(res.summaryText);
      }
    });
  }, [user.id, fetchMonthlySchedule]);

  const handleQuickSyncCalendar = async () => {
    setIsSyncingCalendar(true);
    const res = await nativeCalendarService.syncDutyScheduleToNativeCalendar(schedules);
    setIsSyncingCalendar(false);
    Alert.alert(res.success ? '캘린더 동기화 완료 🗓️' : '동기화 알림', res.message);
  };

  // 4대 디테일 메뉴 모달 상태
  const [alarmModalVisible, setAlarmModalVisible] = useState(false);
  const [fullScheduleModalVisible, setFullScheduleModalVisible] = useState(false);
  const [addScheduleModalVisible, setAddScheduleModalVisible] = useState(false);
  const [dailyNoteModalVisible, setDailyNoteModalVisible] = useState(false);

  // 오늘 / 내일 동적 날짜 계산
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);

  const formatDateKey = (d: Date) =>
    `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

  const todayKey = formatDateKey(today);
  const tomorrowKey = formatDateKey(tomorrow);

  const todayShift = (schedules[todayKey] as ShiftCode) || null;
  const tomorrowShift = (schedules[tomorrowKey] as ShiftCode) || null;

  const todayShiftInfo = todayShift ? SHIFT_TYPES[todayShift] : null;
  const tomorrowShiftInfo = tomorrowShift ? SHIFT_TYPES[tomorrowShift] : null;

  // 일요일 시작 기준 이번 주 7일 계산
  const currentDayOfWeek = today.getDay();
  const weekDays = ['일', '월', '화', '수', '목', '금', '토'];
  const weekData = weekDays.map((dayName, idx) => {
    const d = new Date(today);
    d.setDate(today.getDate() - currentDayOfWeek + idx);
    const key = formatDateKey(d);
    return {
      day: dayName,
      date: d.getDate(),
      dateKey: key,
      shift: (schedules[key] as ShiftCode) || null,
      isToday: key === todayKey,
    };
  });

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <AppHeader />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* ── 인사 배너 ──────────────────────────────── */}
        <View style={styles.greetingBanner}>
          <Text style={styles.greetingText}>
            {displayName}님, 오늘은{' '}
            {todayShiftInfo ? (
              <Text style={[styles.dutyHighlight, { color: todayShiftInfo.color }]}>
                {todayShiftInfo.shortName} 근무
              </Text>
            ) : (
              <Text style={styles.dutyHighlight}>근무 일정 확인</Text>
            )}
            이시네요.
          </Text>
          <Text style={styles.greetingSubText}>
            {todayShift === 'O' || todayShift === 'V'
              ? '달콤한 오프! 재충전 가득한 하루 보내세요 ☕'
              : '오늘도 안전 간호와 건강한 하루를 응원합니다!'}
          </Text>
        </View>

        {/* ── 오늘 / 내일 근무 카드 2열 그리드 ────────── */}
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
              onPress={() => setAlarmModalVisible(true)}
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
                  {/* PRD: 기본 캘린더앱 연계 일정 압축 표시 */}
                  <TouchableOpacity
                    style={styles.calendarSyncBadge}
                    onPress={handleQuickSyncCalendar}
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
              onPress={() => navigation?.navigate('FortuneTab')}
              activeOpacity={0.8}
            >
              <View style={styles.subActionInner}>
                <FortuneIcon size={14} color="#FFFFFF" />
                <Text style={styles.subActionText}>오늘의 운세</Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>

        {/* ── 주간 캘린더 스트립 카드 ─────────────────── */}
        <View style={styles.weekCard}>
          <View style={styles.weekStrip}>
            {weekData.map((item) => {
              const shiftInfo = item.shift ? SHIFT_TYPES[item.shift] : null;
              return (
                <View key={item.dateKey} style={styles.dayColumn}>
                  <Text style={styles.dayLabel}>{item.day}</Text>

                  {item.isToday ? (
                    <View style={styles.todayCircle}>
                      <Text style={styles.todaySubText}>오늘</Text>
                      <Text style={styles.todayDateText}>{item.date}</Text>
                    </View>
                  ) : (
                    <Text style={styles.dateText}>{item.date}</Text>
                  )}

                  {item.shift && shiftInfo ? (
                    <Text style={[styles.shiftLabel, { color: shiftInfo.color }]}>
                      {item.shift}
                    </Text>
                  ) : (
                    <View style={styles.emptyShiftSpace} />
                  )}
                </View>
              );
            })}
          </View>
        </View>

        {/* ── 스케줄 CTA Pill 버튼 2개 ───────────────── */}
        <View style={styles.scheduleButtonRow}>
          <TouchableOpacity
            style={styles.schedulePillBtn}
            onPress={() => setFullScheduleModalVisible(true)}
            activeOpacity={0.85}
          >
            <Text style={styles.schedulePillBtnText}>전체 스케줄 보기  ›</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.schedulePillBtn}
            onPress={() => setAddScheduleModalVisible(true)}
            activeOpacity={0.85}
          >
            <Text style={styles.schedulePillBtnText}>스케줄 추가하기  +</Text>
          </TouchableOpacity>
        </View>

        {/* ── 데일리 노트 ────────────────────────────── */}
        <Text style={styles.sectionTitle}>데일리 노트</Text>
        <View style={styles.noteRow}>
          {/* 특이사항 기록하기 */}
          <TouchableOpacity
            style={styles.noteCard}
            onPress={() => setDailyNoteModalVisible(true)}
            activeOpacity={0.8}
          >
            <View style={styles.noteIconWrapper}>
              <PencilIcon size={24} color="#FFFFFF" />
            </View>
            <Text style={styles.noteCardText}>특이사항 기록하기</Text>
          </TouchableOpacity>

          {/* 업무 가이드 */}
          <TouchableOpacity
            style={styles.noteCard}
            onPress={() =>
              Alert.alert(
                '업무 가이드',
                '병동 주요 프로토콜, 투약 계산식 및 검사 전 처치 가이드가 수록되어 있습니다.'
              )
            }
            activeOpacity={0.8}
          >
            <View style={styles.noteIconWrapper}>
              <BriefcaseIcon size={24} color="#FFFFFF" />
            </View>
            <Text style={styles.noteCardText}>업무 가이드</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* ── 4대 디테일 메뉴 모달들 (Clean Architecture) ── */}
      <ClinicalAlarmModal
        visible={alarmModalVisible}
        onClose={() => setAlarmModalVisible(false)}
      />

      <FullScheduleModal
        visible={fullScheduleModalVisible}
        onClose={() => setFullScheduleModalVisible(false)}
        onOpenAddSchedule={() => setAddScheduleModalVisible(true)}
      />

      <AddScheduleModal
        visible={addScheduleModalVisible}
        onClose={() => setAddScheduleModalVisible(false)}
      />

      <DailyNoteModal
        visible={dailyNoteModalVisible}
        onClose={() => setDailyNoteModalVisible(false)}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: 20,
    paddingBottom: 90,
  },

  // GREETING BANNER
  greetingBanner: {
    marginTop: 6,
    marginBottom: 20,
  },
  greetingText: {
    fontSize: 16,
    color: COLORS.textPrimary,
    lineHeight: 24,
    fontWeight: '500',
  },
  dutyHighlight: {
    color: '#4F98CA',
    fontWeight: '700',
  },
  greetingSubText: {
    fontSize: 14,
    color: COLORS.textMuted,
    marginTop: 2,
  },

  // 2-COLUMN SHIFT GRID
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

  // SUB ACTION BUTTONS (알람 맞추기, 오늘의 운세)
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

  // WEEK CARD
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
    fontSize: 12,
    color: COLORS.textMuted,
    marginBottom: 8,
    fontWeight: '500',
  },
  dateText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: 8,
  },
  todayCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  todaySubText: {
    fontSize: 8,
    color: '#FFFFFF',
    fontWeight: '600',
    lineHeight: 9,
  },
  todayDateText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
    lineHeight: 14,
  },
  shiftLabel: {
    fontSize: 14,
    fontWeight: '800',
  },
  emptyShiftSpace: {
    height: 18,
  },

  // SCHEDULE BUTTON ROW
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

  // DAILY NOTE SECTION
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 14,
  },
  noteRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  noteCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
    minHeight: 110,
    gap: 10,
  },
  noteIconWrapper: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  noteCardText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textPrimary,
    textAlign: 'center',
  },
});

export default DashboardScreen;
