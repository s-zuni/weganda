import React, { useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { COLORS, useAppTheme } from '../../../../constants/theme';
import { useSalaryStore } from '../../../../store/useSalaryStore';
import { useShiftScheduleStore } from '../../../../store/useShiftScheduleStore';
import { WegandaPlusTag } from '../../../common/WegandaPlusTag';
import { EyeIcon, EyeOffIcon } from '../../../common/Icon';

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
    isAmountHidden,
    toggleAmountHidden,
    monthlyRecords,
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

  // 해당 달에 저장된 급여 실적 기록이 있는 경우 해당 실적 우선 반영
  const currentMonthRecord = monthlyRecords[currentYm];

  const effectiveNightRate = customNightAllowance || getInferredNightRate(baseSalary);
  const totalNightPay = nightCount * effectiveNightRate;

  const effectiveHolidayRate = customHolidayAllowance || getInferredHolidayRate(baseSalary);
  const totalHolidayPay = holidayWorkCount * effectiveHolidayRate;

  // 총 예상 수령액
  const totalEstimated = useMemo(() => {
    if (currentMonthRecord && currentMonthRecord.totalSalary > 0) {
      return currentMonthRecord.totalSalary;
    }
    if (baseSalary > 0) {
      return baseSalary + totalNightPay + totalHolidayPay;
    }
    return 3420000;
  }, [currentMonthRecord, baseSalary, totalNightPay, totalHolidayPay]);

  const handlePressCard = () => {
    if (!isPremium) {
      onOpenPaywall();
    } else if (onOpenCalculator) {
      onOpenCalculator();
    }
  };

  const handleToggleEye = () => {
    if (!isPremium) {
      onOpenPaywall();
      return;
    }
    toggleAmountHidden();
  };

  return (
    <TouchableOpacity
      style={styles.salaryCard}
      onPress={handlePressCard}
      activeOpacity={0.85}
    >
      {/* 상단 헤더 행: 타이틀 + weganda+ 마이크로 뱃지 + 눈 가림 토글 + 보러가기/수당 계산기 */}
      <View style={styles.headerRow}>
        <View style={styles.titleRow}>
          <Text style={styles.titleText}>{monthLabel} 예상 실수령액</Text>
          <WegandaPlusTag />
        </View>

        <View style={styles.headerActions}>
          {/* 가림/보기 눈 아이콘 토글 */}
          <TouchableOpacity
            onPress={handleToggleEye}
            style={styles.eyeBtn}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            activeOpacity={0.7}
          >
            {isAmountHidden ? (
              <EyeOffIcon size={18} color={COLORS.textMuted} />
            ) : (
              <EyeIcon size={18} color={theme.primary} />
            )}
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => (isPremium ? onOpenCalculator?.() : onOpenPaywall())}
            activeOpacity={0.7}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Text style={styles.calcLinkText}>급여 명세 ›</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* 금액 표시 또는 보러가기 영역 */}
      <View style={styles.amountContainer}>
        {isAmountHidden ? (
          <View style={styles.maskedRow}>
            <Text style={styles.maskedAmountText}>••••••••원</Text>
            <TouchableOpacity
              style={[styles.viewButton, { backgroundColor: theme.primaryTint }]}
              onPress={() => (isPremium ? onOpenCalculator?.() : onOpenPaywall())}
              activeOpacity={0.8}
            >
              <Text style={[styles.viewButtonText, { color: theme.primary }]}>
                보러가기 ›
              </Text>
            </TouchableOpacity>
          </View>
        ) : (
          <Text style={styles.amountText}>
            {totalEstimated.toLocaleString()}원
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  salaryCard: {
    backgroundColor: COLORS.background,
    borderRadius: 20,
    paddingVertical: 18,
    paddingHorizontal: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 2,
    marginBottom: 20,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  titleText: {
    fontSize: 15,
    fontWeight: '800',
    color: COLORS.textPrimary,
    letterSpacing: -0.3,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  eyeBtn: {
    padding: 2,
  },
  calcLinkText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textMuted,
    letterSpacing: -0.2,
  },
  amountContainer: {
    minHeight: 38,
    justifyContent: 'center',
  },
  amountText: {
    fontSize: 28,
    fontWeight: '900',
    color: COLORS.textPrimary,
    letterSpacing: -0.5,
  },
  maskedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  maskedAmountText: {
    fontSize: 24,
    fontWeight: '800',
    color: COLORS.textMuted,
    letterSpacing: 2,
  },
  viewButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
  },
  viewButtonText: {
    fontSize: 13,
    fontWeight: '700',
  },
});
