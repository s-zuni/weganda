import React, { useState, useEffect, useMemo } from 'react';
import {
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  View,
  Text,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppHeader } from '../../components/common/AppHeader';
import { COLORS, TINT_COLORS } from '../../constants/theme';
import { PaywallBottomSheet } from '../../components/common/PaywallBottomSheet';
import { MembershipScreen } from '../MyPage/MembershipScreen';
import { ShiftCode, SHIFT_TYPES, ShiftInfo } from '../../constants/shiftTypes';
import { useUserStore } from '../../store/useUserStore';
import { useShiftScheduleStore } from '../../store/useShiftScheduleStore';
import { useFriendsStore } from '../../store/useFriendsStore';
import { SharedShiftModal } from '../../components/specific/Friends';

// 대시보드 컴포넌트들
import {
  AddScheduleModal,
  DailyNoteModal,
  GreetingBanner,
  HomeMonthlyCalendar,
  ScheduleActionButtons,
  DailyNoteSection,
  SalaryPredictionCard,
  SalaryCalculatorModal,
} from '../../components/specific/Home';

export const DashboardScreen: React.FC<{ navigation?: any }> = ({ navigation }) => {
  const userId = useUserStore((s) => s.id);
  const userName = useUserStore((s) => s.name);
  const userNickname = useUserStore((s) => s.nickname);
  const { isPremium } = useUserStore();
  const displayName = userNickname || userName || '김간호사';

  const {
    currentDate,
    schedules,
    customCodes,
    fetchMonthlySchedule,
    changeMonth,
    isLoading,
    error,
    clearError,
  } = useShiftScheduleStore();

  const { friends, fetchFriends } = useFriendsStore();

  // 모달 제어 상태
  const [addScheduleModalVisible, setAddScheduleModalVisible] = useState(false);
  const [dailyNoteModalVisible, setDailyNoteModalVisible] = useState(false);
  const [salaryCalculatorModalVisible, setSalaryCalculatorModalVisible] = useState(false);
  const [paywallVisible, setPaywallVisible] = useState(false);
  const [membershipVisible, setMembershipVisible] = useState(false);
  const [sharedShiftModalVisible, setSharedShiftModalVisible] = useState(false);

  useEffect(() => {
    if (userId) {
      fetchMonthlySchedule(userId);
      fetchFriends(userId);
    }
  }, [userId, fetchMonthlySchedule, fetchFriends]);

  // 오늘 날짜 계산
  const today = useMemo(() => new Date(), []);
  const todayKey = useMemo(
    () =>
      `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(
        today.getDate()
      ).padStart(2, '0')}`,
    [today]
  );

  const todayShift = schedules[todayKey] || null;

  const getShiftInfo = (code: string | null): ShiftInfo | null => {
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
    return code in SHIFT_TYPES ? (SHIFT_TYPES as Record<string, ShiftInfo>)[code] : null;
  };

  const todayShiftInfo = getShiftInfo(todayShift);

  const handleMonthChange = (offset: number) => {
    changeMonth(offset, userId || undefined);
  };

  const handleOpenFriendsCalendar = () => {
    if (friends.length > 0) {
      setSharedShiftModalVisible(true);
    } else {
      navigation?.navigate('FriendsTab');
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <AppHeader />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* 네트워크/데이터 로딩 에러 알림 배너 (스케줄 미존재 시 또는 수동 재시도 실패 시 노출, 닫기 가능) */}
        {error && (
          <View style={styles.errorBannerContainer}>
            <TouchableOpacity
              style={styles.errorBanner}
              onPress={() => userId && fetchMonthlySchedule(userId, undefined, true)}
              activeOpacity={0.8}
              accessibilityRole="button"
              accessibilityLabel="근무표 다시 불러오기"
            >
              <Text style={styles.errorBannerText}>⚠️ {error} (터치하여 다시 시도)</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.errorCloseBtn}
              onPress={clearError}
              hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
              accessibilityRole="button"
              accessibilityLabel="오류 알림 닫기"
            >
              <Text style={styles.errorCloseText}>✕</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* 최초 근무표 로딩 인디케이터 */}
        {isLoading && Object.keys(schedules).length === 0 && !error && (
          <View style={styles.loadingBanner}>
            <ActivityIndicator size="small" color={COLORS.primary} />
            <Text style={styles.loadingBannerText}>근무표를 불러오는 중이에요...</Text>
          </View>
        )}

        {/* 1. 상단 인사 배너 (시안 100% 일치) */}
        <GreetingBanner
          displayName={displayName}
          todayShift={todayShift}
          todayShiftInfo={todayShiftInfo}
        />

        {/* 2. 월간 캘린더 (복잡한 그리드 대체, 시안 100% 일치) */}
        <HomeMonthlyCalendar
          currentDate={currentDate}
          schedules={schedules}
          customCodes={customCodes}
          onMonthChange={handleMonthChange}
        />

        {/* 3. 2대 액션 버튼: 친구 캘린더 보기 & 근무표 직접 등록 */}
        <ScheduleActionButtons
          onOpenFriendsCalendar={handleOpenFriendsCalendar}
          onOpenAddSchedule={() => setAddScheduleModalVisible(true)}
        />

        {/* 4. 오늘의 인수인계 메모 (단일 가로형 카드) */}
        <DailyNoteSection
          onOpenDailyNoteModal={() => setDailyNoteModalVisible(true)}
        />

        {/* 5. 9월 예상 실수령액 (weganda+ 마이크로 뱃지 포함) */}
        <SalaryPredictionCard
          isPremium={isPremium}
          onOpenPaywall={() => setPaywallVisible(true)}
          onOpenCalculator={() => setSalaryCalculatorModalVisible(true)}
        />
      </ScrollView>

      {/* 모달 관리 */}
      <AddScheduleModal
        visible={addScheduleModalVisible}
        onClose={() => setAddScheduleModalVisible(false)}
      />

      <DailyNoteModal
        visible={dailyNoteModalVisible}
        onClose={() => setDailyNoteModalVisible(false)}
      />

      <SalaryCalculatorModal
        visible={salaryCalculatorModalVisible}
        onClose={() => setSalaryCalculatorModalVisible(false)}
      />

      <SharedShiftModal
        visible={sharedShiftModalVisible}
        friends={friends}
        onClose={() => setSharedShiftModalVisible(false)}
        onOpenChat={() => {
          setSharedShiftModalVisible(false);
          navigation?.navigate('FriendsTab');
        }}
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
    backgroundColor: COLORS.background,
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: 20,
    paddingBottom: 90,
  },
  errorBannerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: TINT_COLORS.redTint,
    borderColor: TINT_COLORS.redTintBorder,
    borderWidth: 1,
    borderRadius: 12,
    marginBottom: 12,
    paddingHorizontal: 12,
  },
  errorBanner: {
    flex: 1,
    paddingVertical: 10,
    justifyContent: 'center',
  },
  errorBannerText: {
    color: TINT_COLORS.statusRejectedText,
    fontSize: 13,
    fontWeight: '600',
  },
  errorCloseBtn: {
    padding: 6,
    marginLeft: 6,
  },
  errorCloseText: {
    color: TINT_COLORS.statusRejectedText,
    fontSize: 14,
    fontWeight: '700',
  },
  loadingBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 10,
    marginBottom: 12,
  },
  loadingBannerText: {
    color: COLORS.textSecondary,
    fontSize: 13,
    fontWeight: '600',
  },
});

export default DashboardScreen;
