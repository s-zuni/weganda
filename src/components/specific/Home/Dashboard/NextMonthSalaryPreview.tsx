import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { COLORS, useAppTheme } from '../../../../constants/theme';
import { useSalaryStore } from '../../../../store/useSalaryStore';
import { useShiftScheduleStore } from '../../../../store/useShiftScheduleStore';

interface NextMonthSalaryPreviewProps {
  onGoToRecordTab?: () => void;
}

export const NextMonthSalaryPreview: React.FC<NextMonthSalaryPreviewProps> = ({
  onGoToRecordTab,
}) => {
  const theme = useAppTheme();
  const { calculateNextMonthSalary, monthlyRecords } = useSalaryStore();
  const { currentDate, schedules, customCodes } = useShiftScheduleStore();

  // 기본적으로 현재 보고 있는 달의 '다음 달'을 타겟으로 설정
  const defaultNextYm = useMemo(() => {
    const curYear = currentDate.getFullYear();
    const curMonth = currentDate.getMonth() + 1; // 1 ~ 12
    let nextY = curYear;
    let nextM = curMonth + 1;
    if (nextM > 12) {
      nextM = 1;
      nextY += 1;
    }
    return `${nextY}-${String(nextM).padStart(2, '0')}`;
  }, [currentDate]);

  const [targetYm, setTargetYm] = useState<string>(defaultNextYm);

  // 월 전환 핸들러
  const handlePrevMonth = () => {
    const [yStr, mStr] = targetYm.split('-');
    let y = parseInt(yStr, 10);
    let m = parseInt(mStr, 10) - 1;
    if (m < 1) {
      m = 12;
      y -= 1;
    }
    setTargetYm(`${y}-${String(m).padStart(2, '0')}`);
  };

  const handleNextMonth = () => {
    const [yStr, mStr] = targetYm.split('-');
    let y = parseInt(yStr, 10);
    let m = parseInt(mStr, 10) + 1;
    if (m > 12) {
      m = 1;
      y += 1;
    }
    setTargetYm(`${y}-${String(m).padStart(2, '0')}`);
  };

  const calculation = useMemo(() => {
    return calculateNextMonthSalary(targetYm, schedules, customCodes);
  }, [calculateNextMonthSalary, targetYm, schedules, customCodes]);

  const [y, m] = targetYm.split('-');
  const displayTitle = `${y}년 ${parseInt(m, 10)}월`;

  const hasRecordedPastMonth = Object.keys(monthlyRecords).length > 0;

  return (
    <View style={styles.container}>
      {/* ── 1. 예측 대상 월 네비게이터 ── */}
      <View style={styles.monthSelectorRow}>
        <TouchableOpacity
          onPress={handlePrevMonth}
          style={styles.arrowBtn}
          activeOpacity={0.7}
        >
          <Text style={styles.arrowText}>‹</Text>
        </TouchableOpacity>

        <View style={styles.monthTitleBox}>
          <Text style={styles.monthTitleText}>{displayTitle} 예상 월급</Text>
          <Text style={styles.monthSubText}>다음 달 캘린더 근무표 자동 연동</Text>
        </View>

        <TouchableOpacity
          onPress={handleNextMonth}
          style={styles.arrowBtn}
          activeOpacity={0.7}
        >
          <Text style={styles.arrowText}>›</Text>
        </TouchableOpacity>
      </View>

      {/* ── 2. 메인 예상 실수령액 카드 ── */}
      <View style={styles.mainCard}>
        <View style={styles.mainCardHeader}>
          <Text style={styles.mainCardSubLabel}>다음 달 예상 수령액</Text>
          {calculation.basedOnMonth ? (
            <View style={styles.basisBadge}>
              <Text style={styles.basisBadgeText}>
                {calculation.basedOnMonth} 기록 기반 정밀 계산
              </Text>
            </View>
          ) : (
            <View style={[styles.basisBadge, { backgroundColor: '#F3F4F6' }]}>
              <Text style={[styles.basisBadgeText, { color: '#6B7280' }]}>
                기본 설정 단가 기준
              </Text>
            </View>
          )}
        </View>

        <Text style={[styles.totalAmount, { color: theme.primary }]}>
          {calculation.estimatedTotal.toLocaleString()}원
        </Text>

        {/* 근무표 요약 칩 */}
        <View style={styles.dutySummaryRow}>
          <View style={styles.dutyChip}>
            <Text style={styles.dutyChipText}>
              🌙 나이트 {calculation.nightCount}일 배정
            </Text>
          </View>
          <View style={styles.dutyChip}>
            <Text style={styles.dutyChipText}>
              📅 주말근무 {calculation.holidayWorkCount}일
            </Text>
          </View>
        </View>
      </View>

      {/* ── 3. 산출 근거 상세 명세서 ── */}
      <View style={styles.breakdownCard}>
        <Text style={styles.breakdownTitle}>상세 산출 내역</Text>

        {/* 기본급 */}
        <View style={styles.breakdownRow}>
          <View>
            <Text style={styles.itemTitle}>본수당 (기본급)</Text>
            <Text style={styles.itemSub}>
              {calculation.basedOnMonth
                ? `${calculation.basedOnMonth} 급여명세 기준`
                : '통상 임금 기본 단가'}
            </Text>
          </View>
          <Text style={styles.itemAmount}>
            {calculation.baseAllowance.toLocaleString()}원
          </Text>
        </View>

        <View style={styles.divider} />

        {/* 야간수당 */}
        <View style={styles.breakdownRow}>
          <View>
            <Text style={styles.itemTitle}>야간근로수당</Text>
            <Text style={styles.itemSub}>
              {calculation.nightCount}회 × 회당 약 {calculation.effectiveNightRate.toLocaleString()}원
            </Text>
          </View>
          <Text style={[styles.itemAmount, { color: theme.primary }]}>
            +{calculation.nightAllowance.toLocaleString()}원
          </Text>
        </View>

        <View style={styles.divider} />

        {/* 휴일근무수당 */}
        <View style={styles.breakdownRow}>
          <View>
            <Text style={styles.itemTitle}>주말/휴일근로수당</Text>
            <Text style={styles.itemSub}>
              {calculation.holidayWorkCount}회 × 회당 약 {calculation.effectiveHolidayRate.toLocaleString()}원
            </Text>
          </View>
          <Text style={[styles.itemAmount, { color: '#F59E0B' }]}>
            +{calculation.holidayAllowance.toLocaleString()}원
          </Text>
        </View>

        {/* 기타수당 (있을 때만) */}
        {calculation.extraAllowance > 0 && (
          <>
            <View style={styles.divider} />
            <View style={styles.breakdownRow}>
              <View>
                <Text style={styles.itemTitle}>기타수당 (식대/면허수당 등)</Text>
                <Text style={styles.itemSub}>이전 달 고정 수당 계승</Text>
              </View>
              <Text style={styles.itemAmount}>
                +{calculation.extraAllowance.toLocaleString()}원
              </Text>
            </View>
          </>
        )}
      </View>

      {/* ── 4. 기록 유도 및 안내 카드 ── */}
      {!hasRecordedPastMonth ? (
        <View style={styles.tipCard}>
          <Text style={styles.tipTitle}>💡 실제 급여명세를 기록하면 정확도가 대폭 상승합니다</Text>
          <Text style={styles.tipText}>
            지난달 급여명세서의 본수당과 야간수당을 [급여 기록] 탭에서 1번만 입력해 두면, 근무표의 N 횟수와 대조하여 실제 내 병원 단가에 맞춤 계산됩니다.
          </Text>
          {onGoToRecordTab && (
            <TouchableOpacity
              style={[styles.recordBtn, { backgroundColor: theme.primaryTint }]}
              onPress={onGoToRecordTab}
              activeOpacity={0.8}
            >
              <Text style={[styles.recordBtnText, { color: theme.primary }]}>
                지난달 급여 1분 만에 기록하기 ›
              </Text>
            </TouchableOpacity>
          )}
        </View>
      ) : (
        <View style={styles.noticeBox}>
          <Text style={styles.noticeText}>
            💡 입력하신 지난달 급여 실적과 {displayTitle} 근무표를 기반으로 자동 예측되었습니다. 다음 달 근무표에 나이트나 주말 근무를 등록/수정하면 실시간으로 금액이 자동 갱신됩니다.
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 12,
  },
  monthSelectorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  arrowBtn: {
    paddingHorizontal: 14,
    paddingVertical: 6,
  },
  arrowText: {
    fontSize: 22,
    fontWeight: '700',
    color: '#374151',
  },
  monthTitleBox: {
    alignItems: 'center',
  },
  monthTitleText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#111827',
  },
  monthSubText: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  mainCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  mainCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  mainCardSubLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6B7280',
  },
  basisBadge: {
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  basisBadgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#2563EB',
  },
  totalAmount: {
    fontSize: 30,
    fontWeight: '900',
    letterSpacing: -0.5,
    marginVertical: 6,
  },
  dutySummaryRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 10,
  },
  dutyChip: {
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  dutyChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#4B5563',
  },
  breakdownCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginBottom: 16,
  },
  breakdownTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#1F2937',
    marginBottom: 14,
  },
  breakdownRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
  },
  itemTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#374151',
  },
  itemSub: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 2,
  },
  itemAmount: {
    fontSize: 15,
    fontWeight: '800',
    color: '#111827',
  },
  divider: {
    height: 1,
    backgroundColor: '#F3F4F6',
    marginVertical: 10,
  },
  tipCard: {
    backgroundColor: '#FFFBEB',
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: '#FDE68A',
    marginBottom: 20,
  },
  tipTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#92400E',
    marginBottom: 6,
  },
  tipText: {
    fontSize: 12,
    color: '#B45309',
    lineHeight: 18,
    marginBottom: 10,
  },
  recordBtn: {
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  recordBtnText: {
    fontSize: 13,
    fontWeight: '700',
  },
  noticeBox: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginBottom: 20,
  },
  noticeText: {
    fontSize: 12,
    color: '#6B7280',
    lineHeight: 18,
  },
});
