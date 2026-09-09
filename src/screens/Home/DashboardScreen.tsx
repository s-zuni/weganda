import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  SafeAreaView,
  ScrollView,
  StatusBar,
  Alert,
} from 'react-native';
import { AppHeader } from '../../components/common/AppHeader';
import { PaywallBottomSheet } from '../../components/common/PaywallBottomSheet';
import { MembershipScreen } from '../MyPage/MembershipScreen';
import { ShiftCode, SHIFT_TYPES } from '../../constants/shiftTypes';
import { useUserStore } from '../../store/useUserStore';
import { useShiftScheduleStore } from '../../store/useShiftScheduleStore';
import { nativeCalendarService } from '../../services/nativeCalendarService';

// 분리된 서브 모달 및 대시보드 컴포넌트들
import {
  ClinicalAlarmModal,
  FullScheduleModal,
  AddScheduleModal,
  DailyNoteModal,
  GreetingBanner,
  ShiftGridRow,
  WeeklyCalendarStrip,
  ScheduleActionButtons,
  DailyNoteSection,
  SalaryPredictionCard,
} from '../../components/specific/Home';

export const DashboardScreen: React.FC<{ navigation?: any }> = ({ navigation }) => {
  const user = useUserStore((s) => ({ id: s.id, name: s.name, nickname: s.nickname }));
  const { isPremium } = useUserStore();
  const displayName = user.nickname || user.name || '간호사';
  const { schedules, customCodes, fetchMonthlySchedule } = useShiftScheduleStore();

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
  const [paywallVisible, setPaywallVisible] = useState(false);
  const [membershipVisible, setMembershipVisible] = useState(false);

  // 오늘 / 내일 동적 날짜 계산
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);

  const formatDateKey = (d: Date) =>
    `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

  const todayKey = formatDateKey(today);
  const tomorrowKey = formatDateKey(tomorrow);

  const todayShift = (schedules[todayKey] as any) || null;
  const tomorrowShift = (schedules[tomorrowKey] as any) || null;

  const getShiftInfo = (code: string | null) => {
    if (!code) return null;
    if (customCodes[code]) {
      return {
        code: customCodes[code].code,
        name: customCodes[code].name,
        shortName: customCodes[code].name,
        color: customCodes[code].color,
        textColor: customCodes[code].textColor,
        isOff: customCodes[code].isOff,
        description: customCodes[code].name,
      };
    }
    return (SHIFT_TYPES as any)[code] || null;
  };

  const todayShiftInfo = getShiftInfo(todayShift);
  const tomorrowShiftInfo = getShiftInfo(tomorrowShift);

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
        {/* 인사 배너 */}
        <GreetingBanner
          displayName={displayName}
          todayShift={todayShift}
          todayShiftInfo={todayShiftInfo}
        />

        {/* 오늘 / 내일 근무 카드 2열 그리드 */}
        <ShiftGridRow
          today={today}
          tomorrow={tomorrow}
          todayShift={todayShift}
          tomorrowShift={tomorrowShift}
          todayShiftInfo={todayShiftInfo}
          tomorrowShiftInfo={tomorrowShiftInfo}
          tomorrowCalendarEvent={tomorrowCalendarEvent}
          onOpenAlarmModal={() => setAlarmModalVisible(true)}
          onQuickSyncCalendar={handleQuickSyncCalendar}
          onNavigateFortune={() => navigation?.navigate('FortuneTab')}
        />

        {/* 주간 캘린더 스트립 카드 */}
        <WeeklyCalendarStrip weekData={weekData} />

        {/* 스케줄 CTA Pill 버튼 2개 */}
        <ScheduleActionButtons
          onOpenFullSchedule={() => setFullScheduleModalVisible(true)}
          onOpenAddSchedule={() => setAddScheduleModalVisible(true)}
        />

        {/* 데일리 노트 */}
        <DailyNoteSection
          onOpenDailyNoteModal={() => setDailyNoteModalVisible(true)}
        />

        {/* 월급/수당 예측 (weganda+ 프리미엄) */}
        <SalaryPredictionCard
          isPremium={isPremium}
          onOpenPaywall={() => setPaywallVisible(true)}
        />
      </ScrollView>

      {/* 4대 디테일 메뉴 모달들 */}
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

      <PaywallBottomSheet
        visible={paywallVisible}
        onClose={() => setPaywallVisible(false)}
        onSubscribe={() => {
          setPaywallVisible(false);
          setMembershipVisible(true);
        }}
        onLearnMore={() => {
          setPaywallVisible(false);
          setMembershipVisible(true);
        }}
        featureTitle="월급/수당 예측기"
        featureDescription="D/E/N 근무 패턴 기반으로 다음 달 예상 월급을 자동 계산"
      />
      <MembershipScreen
        visible={membershipVisible}
        onClose={() => setMembershipVisible(false)}
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
});

export default DashboardScreen;
