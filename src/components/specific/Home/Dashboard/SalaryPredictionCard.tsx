import React, { useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { COLORS } from '../../../../constants/theme';
import { useSalaryStore } from '../../../../store/useSalaryStore';
import { useShiftScheduleStore } from '../../../../store/useShiftScheduleStore';
import { WegandaPlusTag } from '../../../common/WegandaPlusTag';

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

  // 총 예상 수령액 (기본급이 미설정 상태인 경우 현실적인 평균 간호사 예상 수령액 3,420,000원 표출)
  const totalEstimated = baseSalary > 0
    ? baseSalary + totalNightPay + totalHolidayPay
    : 3420000;

  const handlePressCard = () => {
    if (!isPremium) {
      onOpenPaywall();
    } else if (onOpenCalculator) {
      onOpenCalculator();
    }
  };

  return (
    <TouchableOpacity
      style={styles.salaryCard}
      onPress={handlePressCard}
      activeOpacity={0.85}
    >
      {/* 상단 헤더 행: 타이틀 + weganda+ 마이크로 뱃지 + 수당 계산기 > */}
      <View style={styles.headerRow}>
        <View style={styles.titleRow}>
          <Text style={styles.titleText}>{monthLabel} 예상 실수령액</Text>
          <WegandaPlusTag />
        </View>

        <TouchableOpacity
          onPress={() => (isPremium ? onOpenCalculator?.() : onOpenPaywall())}
          activeOpacity={0.7}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Text style={styles.calcLinkText}>수당 계산기 ›</Text>
        </TouchableOpacity>
      </View>

      {/* 볼드 메인 금액 */}
      <Text style={styles.amountText}>
        {totalEstimated.toLocaleString()}원
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  salaryCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    paddingVertical: 18,
    paddingHorizontal: 20,
    borderWidth: 1,
    borderColor: '#E5E7EB',
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
    color: '#191F28',
    letterSpacing: -0.3,
  },
  calcLinkText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#8B95A1',
    letterSpacing: -0.2,
  },
  amountText: {
    fontSize: 28,
    fontWeight: '900',
    color: '#191F28',
    letterSpacing: -0.5,
  },
});


