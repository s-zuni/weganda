import React, { useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { COLORS, useAppTheme } from '../../../../constants/theme';
import { ChartBarIcon, LockIcon } from '../../../common/Icon';
import { useSalaryStore } from '../../../../store/useSalaryStore';
import { useShiftScheduleStore } from '../../../../store/useShiftScheduleStore';

interface SalaryPredictionCardProps {
  isPremium: boolean;
  onOpenPaywall: () => void;
  onOpenCalculator?: () => void;
}

export const SalaryPredictionCard: React.FC<SalaryPredictionCardProps> = ({
  isPremium,
  onOpenPaywall,
  onOpenCalculator,
}) => {
  const theme = useAppTheme();
  const {
    baseSalary,
    customNightAllowance,
    customHolidayAllowance,
    getInferredNightRate,
    getInferredHolidayRate,
  } = useSalaryStore();
  const { schedules, currentDate, customCodes } = useShiftScheduleStore();

  const currentYm = useMemo(() => {
    const y = currentDate.getFullYear();
    const m = String(currentDate.getMonth() + 1).padStart(2, '0');
    return `${y}-${m}`;
  }, [currentDate]);

  const monthLabel = `${currentDate.getMonth() + 1}월`;

  // 해당 달의 나이트(N) 일수 실시간 계산
  const nightCount = useMemo(() => {
    return Object.entries(schedules).filter(([dateKey, code]) => {
      if (!dateKey.startsWith(currentYm)) return false;
      if (code === 'N') return true;
      const custom = customCodes[code];
      return custom && custom.name && custom.name.includes('나이트');
    }).length;
  }, [schedules, currentYm, customCodes]);

  // 해당 달의 주말/휴일 근무 일수 계산
  const holidayWorkCount = useMemo(() => {
    return Object.entries(schedules).filter(([dateKey, code]) => {
      if (!dateKey.startsWith(currentYm)) return false;
      const d = new Date(dateKey);
      const isWeekend = d.getDay() === 0 || d.getDay() === 6;
      if (!isWeekend) return false;
      if (code === 'O' || code === 'V' || code === '/' || code === 'OFF') return false;
      const custom = customCodes[code];
      if (custom && custom.isOff) return false;
      return true;
    }).length;
  }, [schedules, currentYm, customCodes]);

  const effectiveNightRate = customNightAllowance || getInferredNightRate(baseSalary);
  const totalNightPay = nightCount * effectiveNightRate;

  const effectiveHolidayRate = customHolidayAllowance || getInferredHolidayRate(baseSalary);
  const totalHolidayPay = holidayWorkCount * effectiveHolidayRate;

  const totalEstimated = baseSalary + totalNightPay + totalHolidayPay;

  const handlePress = () => {
    if (!isPremium) {
      onOpenPaywall();
    } else if (onOpenCalculator) {
      onOpenCalculator();
    }
  };

  return (
    <>
      <Text style={styles.sectionTitle}>월급/수당 예측</Text>
      <TouchableOpacity
        style={styles.salaryCard}
        onPress={handlePress}
        activeOpacity={0.8}
      >
        {isPremium ? (
          <>
            <View style={styles.salaryCardHeader}>
              <View style={[styles.salaryIconCircle, { backgroundColor: theme.primary }]}>
                <ChartBarIcon size={22} color={theme.onPrimaryText} />
              </View>
              <View style={styles.salaryCardTexts}>
                <Text style={styles.salaryCardTitle}>{monthLabel} 예상 실수령액</Text>
                <Text style={styles.salaryCardSubtitle}>근무표 실시간 연동</Text>
              </View>
              <View style={styles.editBadge}>
                <Text style={styles.editBadgeText}>수당 계산기 &gt;</Text>
              </View>
            </View>
            <Text style={styles.salaryAmount}>
              {totalEstimated.toLocaleString()}원
            </Text>
            <View style={styles.salaryBreakdownRow}>
              <View style={styles.salaryBreakdownItem}>
                <Text style={styles.breakdownLabel}>기본급</Text>
                <Text style={styles.breakdownValue}>
                  {baseSalary.toLocaleString()}
                </Text>
              </View>
              <View style={styles.salaryBreakdownItem}>
                <Text style={styles.breakdownLabel}>야간수당 ({nightCount}일)</Text>
                <Text style={[styles.breakdownValue, { color: theme.primary }]}>
                  +{totalNightPay.toLocaleString()}
                </Text>
              </View>
              <View style={styles.salaryBreakdownItem}>
                <Text style={styles.breakdownLabel}>휴일수당 ({holidayWorkCount}일)</Text>
                <Text style={styles.breakdownValue}>
                  +{totalHolidayPay.toLocaleString()}
                </Text>
              </View>
            </View>
          </>
        ) : (
          <View style={styles.salaryLockedContent}>
            <View style={styles.salaryLockedIconCircle}>
              <LockIcon size={24} color="#9CA3AF" />
            </View>
            <View style={styles.salaryLockedTexts}>
              <View style={styles.salaryLockedTitleRow}>
                <Text style={styles.salaryLockedTitle}>월급/수당 예측기</Text>
                <View style={styles.premiumOnlyBadge}>
                  <Text style={styles.premiumOnlyText}>weganda+</Text>
                </View>
              </View>
              <Text style={styles.salaryLockedDesc}>
                D/E/N 근무 패턴 기반 다음 달 예상 월급 자동 계산
              </Text>
            </View>
          </View>
        )}
      </TouchableOpacity>
    </>
  );
};

const styles = StyleSheet.create({
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 14,
  },
  salaryCard: {
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
  salaryCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  salaryIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  salaryCardTexts: {
    flex: 1,
  },
  salaryCardTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  salaryCardSubtitle: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 2,
  },
  salaryAmount: {
    fontSize: 28,
    fontWeight: '800',
    color: '#1A1A1A',
    marginBottom: 16,
  },
  salaryBreakdownRow: {
    flexDirection: 'row',
    gap: 12,
  },
  salaryBreakdownItem: {
    flex: 1,
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
  },
  breakdownLabel: {
    fontSize: 11,
    color: '#9CA3AF',
    fontWeight: '600',
    marginBottom: 4,
  },
  breakdownValue: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  salaryLockedContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  salaryLockedIconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  salaryLockedTexts: {
    flex: 1,
  },
  salaryLockedTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  salaryLockedTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  premiumOnlyBadge: {
    backgroundColor: '#FFF8E7',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  premiumOnlyText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#B8922E',
  },
  salaryLockedDesc: {
    fontSize: 13,
    color: '#9CA3AF',
    lineHeight: 18,
  },
  editBadge: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  editBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#4B5563',
  },
});

