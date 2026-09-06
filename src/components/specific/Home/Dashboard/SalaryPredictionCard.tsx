import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { ChartBarIcon, LockIcon } from '../../../common/Icon';
import { MOCK_SALARY_PREDICTION } from '../../../../mocks/membership';

interface SalaryPredictionCardProps {
  isPremium: boolean;
  onOpenPaywall: () => void;
}

export const SalaryPredictionCard: React.FC<SalaryPredictionCardProps> = ({
  isPremium,
  onOpenPaywall,
}) => {
  return (
    <>
      <Text style={styles.sectionTitle}>월급/수당 예측</Text>
      <TouchableOpacity
        style={styles.salaryCard}
        onPress={() => !isPremium && onOpenPaywall()}
        activeOpacity={isPremium ? 1 : 0.8}
      >
        {isPremium ? (
          <>
            <View style={styles.salaryCardHeader}>
              <View style={styles.salaryIconCircle}>
                <ChartBarIcon size={22} color="#FFFFFF" />
              </View>
              <View style={styles.salaryCardTexts}>
                <Text style={styles.salaryCardTitle}>{MOCK_SALARY_PREDICTION.month}</Text>
                <Text style={styles.salaryCardSubtitle}>예상 월급</Text>
              </View>
            </View>
            <Text style={styles.salaryAmount}>
              {MOCK_SALARY_PREDICTION.totalEstimated.toLocaleString()}원
            </Text>
            <View style={styles.salaryBreakdownRow}>
              <View style={styles.salaryBreakdownItem}>
                <Text style={styles.breakdownLabel}>기본급</Text>
                <Text style={styles.breakdownValue}>
                  {MOCK_SALARY_PREDICTION.baseSalary.toLocaleString()}
                </Text>
              </View>
              <View style={styles.salaryBreakdownItem}>
                <Text style={styles.breakdownLabel}>야간수당</Text>
                <Text style={styles.breakdownValue}>
                  +{MOCK_SALARY_PREDICTION.nightAllowance.toLocaleString()}
                </Text>
              </View>
              <View style={styles.salaryBreakdownItem}>
                <Text style={styles.breakdownLabel}>휴일수당</Text>
                <Text style={styles.breakdownValue}>
                  +{MOCK_SALARY_PREDICTION.holidayAllowance.toLocaleString()}
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
    backgroundColor: '#FF507C',
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
});

