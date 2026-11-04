import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { AppHeader } from '../../components/common/AppHeader';
import { COLORS, NEUTRAL, useAppTheme, type ThemeColors } from '../../constants/theme';
import { useTabBarHeight } from '../../hooks/useTabBarHeight';
import { useShiftScheduleStore } from '../../store/useShiftScheduleStore';
import { useUserStore } from '../../store/useUserStore';
import { SHIFT_TYPES } from '../../constants/shiftTypes';
import { SalaryCalculatorModal } from '../../components/specific/Home/Dashboard/SalaryCalculatorModal';
import { BurnoutGuardModal } from '../../components/specific/MyPage/BurnoutGuardModal';
import { MembershipScreen } from '../MyPage/MembershipScreen';
import {
  ChartBarIcon,
  SparklesIcon,
  ShieldCheckIcon,
} from '../../components/common/Icon';

export const ShiftReportScreen: React.FC = () => {
  const theme = useAppTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const navigation = useNavigation<any>();
  const tabBarHeight = useTabBarHeight();

  const { schedules, currentDate } = useShiftScheduleStore();
  const { isPremium } = useUserStore();

  const [salaryModalVisible, setSalaryModalVisible] = useState(false);
  const [burnoutModalVisible, setBurnoutModalVisible] = useState(false);
  const [membershipVisible, setMembershipVisible] = useState(false);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth() + 1;
  const monthPrefix = `${year}-${String(month).padStart(2, '0')}`;

  // 이번 달 D / E / N / O 집계
  const shiftStats = useMemo(() => {
    let dayCount = 0;
    let eveningCount = 0;
    let nightCount = 0;
    let offCount = 0;
    let otherWorkCount = 0;

    Object.entries(schedules).forEach(([dateKey, code]) => {
      if (!dateKey.startsWith(monthPrefix)) return;
      if (code === 'D') dayCount++;
      else if (code === 'E') eveningCount++;
      else if (code === 'N') nightCount++;
      else if (code === 'O') offCount++;
      else if (code) otherWorkCount++;
    });

    const totalWorked = dayCount + eveningCount + nightCount + otherWorkCount;

    return { dayCount, eveningCount, nightCount, offCount, totalWorked };
  }, [schedules, monthPrefix]);

  const handleOpenFortune = () => {
    navigation.navigate('FortuneStack', { screen: 'FortuneHome' });
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['left', 'right']}>
      <AppHeader />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[styles.contentContainer, { paddingBottom: tabBarHeight + 32 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* 상단 타이틀 배너 */}
        <View style={styles.headerSection}>
          <View style={styles.badgeRow}>
            <View style={[styles.proBadge, { backgroundColor: theme.primaryTint }]}>
              <ChartBarIcon size={14} color={theme.primary} />
              <Text style={[styles.proBadgeText, { color: theme.primary }]}>근무 분석 리포트</Text>
            </View>
          </View>
          <Text style={styles.mainTitle}>{year}년 {month}월 근무 통계</Text>
          <Text style={styles.subtitle}>
            이번 달 교대근무 분포와 예상 수당, 워크스타일을 분석했습니다.
          </Text>
        </View>

        {/* 1. 근무 통계 그리드 */}
        <View style={styles.statsCard}>
          <Text style={styles.cardHeaderTitle}>이번 달 듀티 요약</Text>
          <View style={styles.statsRow}>
            <View style={styles.statBox}>
              <View style={[styles.statDot, { backgroundColor: SHIFT_TYPES.D.color }]} />
              <Text style={styles.statLabel}>주간 (D)</Text>
              <Text style={styles.statValue}>{shiftStats.dayCount}회</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statBox}>
              <View style={[styles.statDot, { backgroundColor: SHIFT_TYPES.E.color }]} />
              <Text style={styles.statLabel}>저녁 (E)</Text>
              <Text style={styles.statValue}>{shiftStats.eveningCount}회</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statBox}>
              <View style={[styles.statDot, { backgroundColor: SHIFT_TYPES.N.color }]} />
              <Text style={styles.statLabel}>야간 (N)</Text>
              <Text style={styles.statValue}>{shiftStats.nightCount}회</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statBox}>
              <View style={[styles.statDot, { backgroundColor: SHIFT_TYPES.O.color }]} />
              <Text style={styles.statLabel}>휴무 (O)</Text>
              <Text style={styles.statValue}>{shiftStats.offCount}일</Text>
            </View>
          </View>

          <View style={styles.summaryBar}>
            <Text style={styles.summaryBarText}>
              총 근무일수 <Text style={styles.summaryBarBold}>{shiftStats.totalWorked}일</Text> · 오프 <Text style={styles.summaryBarBold}>{shiftStats.offCount}일</Text>
            </Text>
          </View>
        </View>

        {/* 2. 주요 리포트 바로가기 카드 섹션 */}
        <Text style={styles.sectionHeader}>정밀 분석 리포트</Text>

        {/* 리포트 카드 1: 월급 & 수당 예측기 */}
        <TouchableOpacity
          style={styles.actionCard}
          onPress={() => setSalaryModalVisible(true)}
          activeOpacity={0.8}
        >
          <View style={[styles.iconBox, { backgroundColor: '#EFF6FF' }]}>
            <Text style={styles.iconEmoji}>💰</Text>
          </View>
          <View style={styles.cardTextContainer}>
            <View style={styles.cardTagRow}>
              <Text style={styles.cardTag}>수당 통계</Text>
            </View>
            <Text style={styles.actionCardTitle}>월급 & 야간·휴일 수당 계산기</Text>
            <Text style={styles.actionCardDesc}>
              나이트 횟수와 휴일 가산을 자동 반영하여 이번 달 예상 실질 수당을 계산합니다.
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color={NEUTRAL.gray400} />
        </TouchableOpacity>

        {/* 리포트 카드 2: 근무표 워라밸 & 휴식 밸런스 */}
        <TouchableOpacity
          style={styles.actionCard}
          onPress={() => setBurnoutModalVisible(true)}
          activeOpacity={0.8}
        >
          <View style={[styles.iconBox, { backgroundColor: '#ECFDF5' }]}>
            <ShieldCheckIcon size={24} color="#10B981" />
          </View>
          <View style={styles.cardTextContainer}>
            <View style={styles.cardTagRow}>
              <Text style={[styles.cardTag, { color: '#059669', backgroundColor: '#D1FAE5' }]}>워라밸</Text>
            </View>
            <Text style={styles.actionCardTitle}>근무표 워라밸 & 휴식 밸런스</Text>
            <Text style={styles.actionCardDesc}>
              교대 패턴(퐁당퐁당, 연속 나이트)을 분석하여 수면 부채와 휴식 밸런스를 진단합니다.
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color={NEUTRAL.gray400} />
        </TouchableOpacity>

        {/* 3. 서브 서비스 배너: 듀티 마인드셋 & 워크스타일 */}
        <Text style={styles.sectionHeader}>라이프 & 마인드케어</Text>
        <TouchableOpacity
          style={styles.fortuneSubCard}
          onPress={handleOpenFortune}
          activeOpacity={0.85}
        >
          <View style={styles.fortuneSubHeader}>
            <View style={[styles.sparkleIconBox, { backgroundColor: theme.primaryTint }]}>
              <SparklesIcon size={20} color={theme.primary} />
            </View>
            <View style={styles.fortuneSubTexts}>
              <View style={styles.fortuneTagRow}>
                <Text style={[styles.fortuneTag, { color: theme.primary, backgroundColor: theme.primaryTint }]}>
                  AI 맞춤 분석
                </Text>
              </View>
              <Text style={styles.fortuneSubTitle}>듀티 마인드셋 & 워크스타일 리포트</Text>
              <Text style={styles.fortuneSubDesc}>
                나의 기질과 에너지 흐름에 맞춘 오늘의 듀티 팁, 부서 적응도, 커리어 로드맵을 확인해 보세요.
              </Text>
            </View>
          </View>

          <View style={styles.fortuneSubActionRow}>
            <Text style={[styles.fortuneSubActionText, { color: theme.primary }]}>
              워크스타일 리포트 확인하기
            </Text>
            <Ionicons name="chevron-forward" size={16} color={theme.primary} />
          </View>
        </TouchableOpacity>
      </ScrollView>

      {/* 모달 연동 */}
      <SalaryCalculatorModal
        visible={salaryModalVisible}
        onClose={() => setSalaryModalVisible(false)}
      />

      <BurnoutGuardModal
        visible={burnoutModalVisible}
        onClose={() => setBurnoutModalVisible(false)}
        isPremium={isPremium}
        onOpenMembership={() => {
          setBurnoutModalVisible(false);
          setMembershipVisible(true);
        }}
      />

      <MembershipScreen
        visible={membershipVisible}
        onClose={() => setMembershipVisible(false)}
      />
    </SafeAreaView>
  );
};

const createStyles = (theme: ThemeColors) =>
  StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: COLORS.background,
    },
    scrollView: {
      flex: 1,
    },
    contentContainer: {
      paddingHorizontal: 20,
      paddingTop: 12,
    },
    headerSection: {
      marginBottom: 20,
    },
    badgeRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 8,
    },
    proBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 12,
      gap: 4,
    },
    proBadgeText: {
      fontSize: 12,
      fontWeight: '700',
    },
    mainTitle: {
      fontSize: 24,
      fontWeight: '800',
      color: COLORS.textPrimary,
      marginBottom: 6,
      letterSpacing: -0.4,
    },
    subtitle: {
      fontSize: 14,
      color: COLORS.textSecondary,
      lineHeight: 20,
    },
    statsCard: {
      backgroundColor: '#FFFFFF',
      borderRadius: 20,
      padding: 20,
      marginBottom: 24,
      borderWidth: 1,
      borderColor: '#F3F4F6',
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.05,
      shadowRadius: 10,
      elevation: 2,
    },
    cardHeaderTitle: {
      fontSize: 15,
      fontWeight: '700',
      color: COLORS.textPrimary,
      marginBottom: 16,
    },
    statsRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    statBox: {
      flex: 1,
      alignItems: 'center',
    },
    statDot: {
      width: 10,
      height: 10,
      borderRadius: 5,
      marginBottom: 6,
    },
    statLabel: {
      fontSize: 11,
      color: COLORS.textSecondary,
      marginBottom: 4,
      fontWeight: '600',
    },
    statValue: {
      fontSize: 16,
      fontWeight: '800',
      color: COLORS.textPrimary,
    },
    statDivider: {
      width: 1,
      height: 28,
      backgroundColor: '#F3F4F6',
    },
    summaryBar: {
      marginTop: 16,
      paddingTop: 12,
      borderTopWidth: 1,
      borderTopColor: '#F3F4F6',
      alignItems: 'center',
    },
    summaryBarText: {
      fontSize: 13,
      color: COLORS.textSecondary,
    },
    summaryBarBold: {
      fontWeight: '700',
      color: COLORS.textPrimary,
    },
    sectionHeader: {
      fontSize: 16,
      fontWeight: '700',
      color: COLORS.textPrimary,
      marginBottom: 12,
      marginTop: 8,
    },
    actionCard: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: '#FFFFFF',
      borderRadius: 18,
      padding: 16,
      marginBottom: 14,
      borderWidth: 1,
      borderColor: '#F3F4F6',
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.04,
      shadowRadius: 8,
      elevation: 2,
    },
    iconBox: {
      width: 44,
      height: 44,
      borderRadius: 12,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: 14,
    },
    iconEmoji: {
      fontSize: 22,
    },
    cardTextContainer: {
      flex: 1,
      marginRight: 8,
    },
    cardTagRow: {
      flexDirection: 'row',
      marginBottom: 4,
    },
    cardTag: {
      fontSize: 11,
      fontWeight: '700',
      color: '#2563EB',
      backgroundColor: '#EFF6FF',
      paddingHorizontal: 6,
      paddingVertical: 2,
      borderRadius: 6,
    },
    actionCardTitle: {
      fontSize: 15,
      fontWeight: '700',
      color: COLORS.textPrimary,
      marginBottom: 4,
    },
    actionCardDesc: {
      fontSize: 12,
      color: COLORS.textSecondary,
      lineHeight: 17,
    },
    fortuneSubCard: {
      backgroundColor: '#FFFFFF',
      borderRadius: 18,
      padding: 18,
      borderWidth: 1.5,
      borderColor: `${theme.primary}25`,
      shadowColor: theme.primary,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.08,
      shadowRadius: 10,
      elevation: 3,
      marginBottom: 16,
    },
    fortuneSubHeader: {
      flexDirection: 'row',
      alignItems: 'flex-start',
    },
    sparkleIconBox: {
      width: 40,
      height: 40,
      borderRadius: 12,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: 12,
    },
    fortuneSubTexts: {
      flex: 1,
    },
    fortuneTagRow: {
      flexDirection: 'row',
      marginBottom: 4,
    },
    fortuneTag: {
      fontSize: 11,
      fontWeight: '700',
      paddingHorizontal: 6,
      paddingVertical: 2,
      borderRadius: 6,
    },
    fortuneSubTitle: {
      fontSize: 15,
      fontWeight: '700',
      color: COLORS.textPrimary,
      marginBottom: 4,
    },
    fortuneSubDesc: {
      fontSize: 12,
      color: COLORS.textSecondary,
      lineHeight: 18,
    },
    fortuneSubActionRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'flex-end',
      marginTop: 14,
      paddingTop: 12,
      borderTopWidth: 1,
      borderTopColor: '#FEE2E2',
      gap: 4,
    },
    fortuneSubActionText: {
      fontSize: 13,
      fontWeight: '700',
    },
  });

export default ShiftReportScreen;
