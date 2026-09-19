import React, { useMemo } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Platform,
} from 'react-native';
import { COLORS, useAppTheme } from '../../../constants/theme';
import { useBurnoutStore } from '../../../store/useBurnoutStore';
import { useShiftScheduleStore } from '../../../store/useShiftScheduleStore';
import { ShieldCheckIcon, LockIcon } from '../../common/Icon';

interface BurnoutGuardModalProps {
  visible: boolean;
  onClose: () => void;
  isPremium: boolean;
  onOpenMembership: () => void;
}

export const BurnoutGuardModal: React.FC<BurnoutGuardModalProps> = ({
  visible,
  onClose,
  isPremium,
  onOpenMembership,
}) => {
  const theme = useAppTheme();
  const { schedules, currentDate, customCodes } = useShiftScheduleStore();
  const { analyzeSchedules } = useBurnoutStore();

  const currentYm = useMemo(() => {
    const y = currentDate.getFullYear();
    const m = String(currentDate.getMonth() + 1).padStart(2, '0');
    return `${y}-${m}`;
  }, [currentDate]);

  const monthLabel = `${currentDate.getMonth() + 1}월`;

  const report = useMemo(() => {
    return analyzeSchedules(schedules, currentYm, customCodes);
  }, [analyzeSchedules, schedules, currentYm, customCodes]);

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'danger':
        return '#EF4444';
      case 'warning':
        return '#F59E0B';
      case 'caution':
        return '#3B82F6';
      default:
        return '#10B981';
    }
  };

  const riskColor = getRiskColor(report.riskLevel);

  return (
    <Modal visible={visible} animationType="slide" transparent={false} onRequestClose={onClose}>
      <SafeAreaView style={styles.safeArea}>
        {/* 헤더 */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
            <Text style={[styles.backText, { color: theme.primary }]}>‹ 닫기</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>스마트 듀티 건강 & 번아웃 분석</Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {/* 타이틀 배너 */}
          <View style={styles.bannerCard}>
            <View style={[styles.bannerIconCircle, { backgroundColor: theme.primaryTint }]}>
              <ShieldCheckIcon size={24} color={theme.primary} />
            </View>
            <View style={styles.bannerTexts}>
              <Text style={styles.bannerTitle}>{monthLabel} 간호 듀티 생체 리듬 사정</Text>
              <Text style={styles.bannerSub}>
                3교대 취약 패턴(N-O-D, 연속 나이트, 수면 부채)을 AI가 정밀 분석합니다.
              </Text>
            </View>
          </View>

          {/* 메인 번아웃 스코어 카드 */}
          <View style={styles.scoreCard}>
            <View style={styles.scoreHeader}>
              <Text style={styles.scoreLabel}>이번 달 번아웃 위험 지수</Text>
              <View style={[styles.riskTag, { backgroundColor: `${riskColor}18` }]}>
                <Text style={[styles.riskTagText, { color: riskColor }]}>{report.riskTitle}</Text>
              </View>
            </View>

            <View style={styles.scoreRow}>
              <Text style={[styles.scoreValue, { color: riskColor }]}>{report.burnoutScore}</Text>
              <Text style={styles.scoreMax}> / 100점</Text>
            </View>

            {/* 게이지 바 */}
            <View style={styles.gaugeTrack}>
              <View style={[styles.gaugeFill, { width: `${report.burnoutScore}%`, backgroundColor: riskColor }]} />
            </View>

            <Text style={styles.scoreDesc}>
              총 근무일 {report.totalDutyDays}일 중 나이트 {report.totalNightDays}일이 배정되어 있습니다.
            </Text>
          </View>

          {/* 무료 회원 잠금 오버레이 또는 유료 정밀 분석 */}
          {!isPremium ? (
            <View style={styles.lockedContainer}>
              <View style={styles.lockedCard}>
                <View style={styles.lockIconBox}>
                  <LockIcon size={32} color="#D97706" />
                </View>
                <Text style={styles.lockedTitle}>weganda+ 멤버십 전용 정밀 리포트</Text>
                <Text style={styles.lockedDesc}>
                  3교대 간호사 맞춤 퐁당퐁당(N-O-D) 발생 횟수, 연속 나이트 생체 리듬 분석, 수면 부채 시간 및 최적 수면 골든타임을 무제한으로 분석받으세요.
                </Text>

                <TouchableOpacity
                  style={[styles.unlockBtn, { backgroundColor: theme.primary }]}
                  onPress={onOpenMembership}
                  activeOpacity={0.85}
                >
                  <Text style={styles.unlockBtnText}>weganda+ 시작하고 정밀 분석 보기</Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <>
              {/* 3대 취약점 지표 그리드 */}
              <Text style={styles.sectionTitle}>💡 3대 핵심 교대근무 취약 지표</Text>

              {/* 1. 퐁당퐁당 */}
              <View style={styles.metricCard}>
                <View style={styles.metricHeaderRow}>
                  <View style={styles.metricTitleGroup}>
                    <Text style={styles.metricIcon}>⚡</Text>
                    <Text style={styles.metricTitle}>퐁당퐁당 (N - O - D) 패턴</Text>
                  </View>
                  <View style={[styles.countBadge, report.nodCount > 0 ? styles.countBadgeDanger : styles.countBadgeSafe]}>
                    <Text style={[styles.countBadgeText, report.nodCount > 0 ? styles.countBadgeTextDanger : styles.countBadgeTextSafe]}>
                      {report.nodCount}회 발생
                    </Text>
                  </View>
                </View>
                <Text style={styles.metricDesc}>
                  나이트 근무 퇴근 후 단 하루 오프 쉬고 바로 데이로 출근하는 패턴은 24시간 내 수면 주기를 180도 뒤집어 심혈관계와 교감신경에 가장 치명적인 타격을 줍니다.
                </Text>
              </View>

              {/* 2. 나이트 연속 3회 이상 */}
              <View style={styles.metricCard}>
                <View style={styles.metricHeaderRow}>
                  <View style={styles.metricTitleGroup}>
                    <Text style={styles.metricIcon}>🌙</Text>
                    <Text style={styles.metricTitle}>나이트 3연속 이상 고위험군</Text>
                  </View>
                  <View style={[styles.countBadge, report.consecutiveNightIncidents > 0 ? styles.countBadgeDanger : styles.countBadgeSafe]}>
                    <Text style={[styles.countBadgeText, report.consecutiveNightIncidents > 0 ? styles.countBadgeTextDanger : styles.countBadgeTextSafe]}>
                      {report.consecutiveNightIncidents}구간 (최대 {report.consecutiveNightMax}연속)
                    </Text>
                  </View>
                </View>
                <Text style={styles.metricDesc}>
                  나이트가 3일 이상 지속되면 주간 멜라토닌 분비가 억제되어 만성 불면증과 주의력 저하를 유발합니다. 연속 나이트 후에는 최소 48시간의 연속 휴식이 권장됩니다.
                </Text>
              </View>

              {/* 3. 누적 수면 부채 */}
              <View style={styles.metricCard}>
                <View style={styles.metricHeaderRow}>
                  <View style={styles.metricTitleGroup}>
                    <Text style={styles.metricIcon}>⏳</Text>
                    <Text style={styles.metricTitle}>월간 추정 수면 부채 (Sleep Debt)</Text>
                  </View>
                  <View style={[styles.countBadge, styles.countBadgeWarning]}>
                    <Text style={[styles.countBadgeText, styles.countBadgeTextWarning]}>
                      약 {report.sleepDebtHours}시간 결손
                    </Text>
                  </View>
                </View>
                <Text style={styles.metricDesc}>
                  교대 근무 전환 간 발생한 수면 손실 시간입니다. 수면 부채는 몰아서 자는 것보다 일자별 토막잠(90분 REM 사이클)으로 분할 상환하는 것이 효과적입니다.
                </Text>
              </View>

              {/* 최적 수면 골든타임 & 신체 회복 가이드 */}
              <Text style={styles.sectionTitle}>🛌 AI 맞춤 회복 골든타임 가이드</Text>

              <View style={styles.guideCard}>
                <View style={styles.guideItem}>
                  <Text style={styles.guideLabel}>나이트 전후 최적 숙면 시간대</Text>
                  <Text style={[styles.guideValue, { color: theme.primary }]}>{report.goldenSleepTime}</Text>
                  <Text style={styles.guideHint}>
                    빛과 소음을 완전 차단한 암막 환경에서 최소 6시간 연속 수면 권장
                  </Text>
                </View>

                <View style={styles.guideDivider} />

                <View style={styles.guideItem}>
                  <Text style={styles.guideLabel}>카페인 섭취 컷오프(중단) 기준</Text>
                  <Text style={[styles.guideValue, { color: '#F59E0B' }]}>{report.caffeineCutoffTime}</Text>
                  <Text style={styles.guideHint}>
                    퇴근 전 4시간 이내 카페인은 입면 지연과 심박수 상승의 주원인입니다.
                  </Text>
                </View>

                <View style={styles.guideDivider} />

                <View style={styles.guideItem}>
                  <Text style={styles.guideLabel}>이달의 임상 권고 조언</Text>
                  <Text style={styles.guideAdviceText}>{report.advice}</Text>
                </View>
              </View>
            </>
          )}
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 14,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  backText: {
    fontSize: 16,
    fontWeight: '700',
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#111827',
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    paddingBottom: 40,
  },
  bannerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    gap: 12,
  },
  bannerIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bannerTexts: {
    flex: 1,
  },
  bannerTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#111827',
  },
  bannerSub: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
    lineHeight: 16,
  },
  scoreCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 20,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
    marginBottom: 20,
  },
  scoreHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  scoreLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4B5563',
  },
  riskTag: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  riskTagText: {
    fontSize: 12,
    fontWeight: '700',
  },
  scoreRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginVertical: 10,
  },
  scoreValue: {
    fontSize: 42,
    fontWeight: '900',
  },
  scoreMax: {
    fontSize: 16,
    fontWeight: '600',
    color: '#9CA3AF',
  },
  gaugeTrack: {
    height: 10,
    backgroundColor: '#E5E7EB',
    borderRadius: 5,
    overflow: 'hidden',
    marginBottom: 12,
  },
  gaugeFill: {
    height: '100%',
    borderRadius: 5,
  },
  scoreDesc: {
    fontSize: 13,
    color: '#6B7280',
  },
  lockedContainer: {
    marginTop: 8,
  },
  lockedCard: {
    backgroundColor: '#FFFBEB',
    borderRadius: 18,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#FDE68A',
  },
  lockIconBox: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#FEF3C7',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  lockedTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#92400E',
    marginBottom: 8,
    textAlign: 'center',
  },
  lockedDesc: {
    fontSize: 13,
    color: '#B45309',
    textAlign: 'center',
    lineHeight: 19,
    marginBottom: 20,
  },
  unlockBtn: {
    height: 48,
    paddingHorizontal: 24,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  unlockBtnText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 12,
    marginTop: 10,
  },
  metricCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  metricHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  metricTitleGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  metricIcon: {
    fontSize: 18,
  },
  metricTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#111827',
  },
  countBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  countBadgeText: {
    fontSize: 12,
    fontWeight: '700',
  },
  countBadgeSafe: {
    backgroundColor: '#ECFDF5',
  },
  countBadgeTextSafe: {
    fontSize: 12,
    fontWeight: '700',
    color: '#059669',
  },
  countBadgeDanger: {
    backgroundColor: '#FEF2F2',
  },
  countBadgeTextDanger: {
    fontSize: 12,
    fontWeight: '700',
    color: '#DC2626',
  },
  countBadgeWarning: {
    backgroundColor: '#FFFBEB',
  },
  countBadgeTextWarning: {
    fontSize: 12,
    fontWeight: '700',
    color: '#D97706',
  },
  metricDesc: {
    fontSize: 13,
    color: '#4B5563',
    lineHeight: 18,
  },
  guideCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginBottom: 24,
  },
  guideItem: {
    paddingVertical: 6,
  },
  guideLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6B7280',
    marginBottom: 4,
  },
  guideValue: {
    fontSize: 17,
    fontWeight: '800',
    marginBottom: 4,
  },
  guideHint: {
    fontSize: 12,
    color: '#9CA3AF',
    lineHeight: 16,
  },
  guideAdviceText: {
    fontSize: 13,
    color: '#374151',
    lineHeight: 19,
    fontWeight: '500',
  },
  guideDivider: {
    height: 1,
    backgroundColor: '#F3F4F6',
    marginVertical: 10,
  },
});
