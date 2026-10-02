import React, { useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MembershipPlanKey, CurrentPlanPricing } from '../../../types/membershipEvent';
import { COLORS, NEUTRAL, TINT_COLORS, useAppTheme, type ThemeColors } from '../../../constants/theme';

export interface MembershipPlanSelectorProps {
  selectedPlan: MembershipPlanKey;
  onSelectPlan: (plan: MembershipPlanKey) => void;
  monthlyPricing: CurrentPlanPricing;
  yearlyPricing: CurrentPlanPricing;
}

export const MembershipPlanSelector: React.FC<MembershipPlanSelectorProps> = ({
  selectedPlan,
  onSelectPlan,
  monthlyPricing,
  yearlyPricing,
}) => {
  const theme = useAppTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  return (
    <View style={styles.planSelectorContainer}>
      <Text style={styles.planSelectorTitle}>멤버십 플랜 선택</Text>
      <View style={styles.planCardsRow}>
        {/* 월간 플랜 */}
        <TouchableOpacity
          style={[styles.planCard, styles.monthlyCard]}
          onPress={() => onSelectPlan('monthly')}
          activeOpacity={0.85}
          accessibilityRole="button"
          accessibilityLabel="월간 정기구독 선택"
        >
          <View style={styles.planCardHeader}>
            <View style={styles.titleRow}>
              <View style={[styles.radioCircle, selectedPlan === 'monthly' && styles.radioCircleSelected]}>
                {selectedPlan === 'monthly' && <View style={styles.radioDot} />}
              </View>
              <Text style={styles.planCardName}>월간 정기구독</Text>
            </View>
            {monthlyPricing.isDiscountActive && (
              <View style={styles.discountPill}>
                <Text style={styles.discountPillText}>-25% 평생할인</Text>
              </View>
            )}
          </View>

          <View style={styles.priceRow}>
            <Text style={styles.currentPriceText}>
              ₩{monthlyPricing.currentPrice.toLocaleString()}
            </Text>
            <Text style={styles.pricePeriodText}>/ 월</Text>
          </View>

          {monthlyPricing.isDiscountActive && (
            <Text style={styles.originalPriceCrossed}>
              ₩{monthlyPricing.originalPrice.toLocaleString()}
            </Text>
          )}
          <Text style={styles.planBenefitNote}>출시 얼리버드 평생 보장</Text>
        </TouchableOpacity>

        {/* 연간 플랜 (추천) */}
        <TouchableOpacity
          style={[styles.planCard, styles.yearlyCard]}
          onPress={() => onSelectPlan('yearly')}
          activeOpacity={0.85}
          accessibilityRole="button"
          accessibilityLabel="연간 정기구독 선택"
        >
          <View style={styles.popularTag}>
            <Text style={styles.popularTagText}>BEST • 최대 절약</Text>
          </View>

          <View style={styles.planCardHeader}>
            <View style={styles.titleRow}>
              <View style={[styles.radioCircle, selectedPlan === 'yearly' && styles.radioCircleSelected]}>
                {selectedPlan === 'yearly' && <View style={styles.radioDot} />}
              </View>
              <Text style={[styles.planCardName, styles.planCardNameYearly]}>연간 정기구독</Text>
            </View>
            {yearlyPricing.isDiscountActive && (
              <View style={[styles.discountPill, styles.yearlyDiscountPill]}>
                <Text style={[styles.discountPillText, styles.yearlyDiscountPillText]}>
                  평생 5.9만
                </Text>
              </View>
            )}
          </View>

          <View style={styles.priceRow}>
            <Text style={styles.currentPriceText}>
              ₩{yearlyPricing.currentPrice.toLocaleString()}
            </Text>
            <Text style={styles.pricePeriodText}>/ 년</Text>
          </View>

          {yearlyPricing.isDiscountActive && (
            <Text style={styles.originalPriceCrossed}>
              ₩{yearlyPricing.originalPrice.toLocaleString()}
            </Text>
          )}
          <Text style={styles.planBenefitNote}>월 약 4,916원 (추가 절약)</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const createStyles = (theme: ThemeColors) => StyleSheet.create({
  planSelectorContainer: {
    paddingHorizontal: 20,
    marginTop: 16,
    marginBottom: 8,
  },
  planSelectorTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: NEUTRAL.gray800,
    marginBottom: 12,
  },
  planCardsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  planCard: {
    flex: 1,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1.5,
    position: 'relative',
  },
  monthlyCard: {
    backgroundColor: NEUTRAL.gray50,
    borderColor: NEUTRAL.gray200,
  },
  yearlyCard: {
    backgroundColor: theme.primaryTint,
    borderColor: theme.primary,
  },
  popularTag: {
    position: 'absolute',
    top: -10,
    right: 12,
    backgroundColor: theme.primary,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  popularTagText: {
    color: theme.onPrimaryText,
    fontSize: 10,
    fontWeight: '800',
  },
  planCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
    flexWrap: 'wrap',
    gap: 4,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  radioCircle: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: NEUTRAL.gray300,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioCircleSelected: {
    borderColor: theme.primary,
  },
  radioDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: theme.primary,
  },
  planCardName: {
    fontSize: 13,
    fontWeight: '700',
    color: NEUTRAL.gray700,
  },
  planCardNameYearly: {
    color: theme.primary,
  },
  discountPill: {
    backgroundColor: theme.primaryTint,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  discountPillText: {
    fontSize: 10,
    fontWeight: '800',
    color: theme.primary,
  },
  yearlyDiscountPill: {
    backgroundColor: TINT_COLORS.statusVerifiedBg,
  },
  yearlyDiscountPillText: {
    color: TINT_COLORS.statusVerifiedText,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 2,
  },
  currentPriceText: {
    fontSize: 18,
    fontWeight: '800',
    color: NEUTRAL.gray900,
  },
  pricePeriodText: {
    fontSize: 12,
    color: NEUTRAL.gray500,
    fontWeight: '600',
  },
  originalPriceCrossed: {
    fontSize: 11,
    color: COLORS.textMuted,
    textDecorationLine: 'line-through',
    marginTop: 2,
  },
  planBenefitNote: {
    fontSize: 11,
    color: COLORS.status.success,
    fontWeight: '600',
    marginTop: 8,
  },
});

