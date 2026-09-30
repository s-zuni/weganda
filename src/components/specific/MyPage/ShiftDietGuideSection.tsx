import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { COLORS, useAppTheme } from '../../../constants/theme';
import { ShiftHealthReport, ShiftMealGuide } from '../../../store/useBurnoutStore';

interface ShiftDietGuideSectionProps {
  report: ShiftHealthReport;
}

export const ShiftDietGuideSection: React.FC<ShiftDietGuideSectionProps> = ({ report }) => {
  const theme = useAppTheme();
  const [selectedShift, setSelectedShift] = useState<'D' | 'E' | 'N' | 'O'>('D');

  const { dietPrescription, shiftMealGuides } = report;
  const currentGuide: ShiftMealGuide = shiftMealGuides[selectedShift];

  const shiftTabs: Array<{ key: 'D' | 'E' | 'N' | 'O'; label: string; color: string }> = [
    { key: 'D', label: '데이 (D)', color: COLORS.shift.day },
    { key: 'E', label: '이브닝 (E)', color: COLORS.shift.evening },
    { key: 'N', label: '나이트 (N)', color: COLORS.shift.night },
    { key: 'O', label: '오프 (Off)', color: COLORS.shift.off },
  ];

  return (
    <View style={styles.container}>
      <Text style={styles.sectionHeaderTitle}>듀티 맞춤 영양 & 식단 가이드</Text>
      <Text style={styles.sectionHeaderSub}>
        3교대 생체시계(Circadian) 리듬에 맞춰 위장 장애와 급격한 혈당 스파이크를 방어합니다.
      </Text>

      {/* ── 1. 이달의 AI 식단 처방 카드 ── */}
      {dietPrescription && (
        <View style={styles.prescriptionCard}>
          <View style={styles.prescHeaderRow}>
            <View style={[styles.prescBadge, { backgroundColor: theme.primaryTint }]}>
              <Text style={[styles.prescBadgeText, { color: theme.primary }]}>
                {dietPrescription.badge}
              </Text>
            </View>
            <Text style={styles.prescTag}>이달의 스케줄 처방</Text>
          </View>

          <Text style={styles.prescTitle}>{dietPrescription.title}</Text>
          <Text style={styles.prescSummary}>{dietPrescription.summary}</Text>

          <View style={styles.prescDivider} />

          <View style={styles.guidelineList}>
            {dietPrescription.guidelines.map((item, idx) => (
              <View key={idx} style={styles.guidelineItem}>
                <Text style={[styles.checkBullet, { color: theme.primary }]}>✓</Text>
                <Text style={styles.guidelineText}>{item}</Text>
              </View>
            ))}
          </View>
        </View>
      )}

      {/* ── 2. 듀티 선택 세그먼트 (D / E / N / O) ── */}
      <View style={styles.shiftSegmentRow}>
        {shiftTabs.map((tab) => {
          const isSelected = selectedShift === tab.key;
          return (
            <TouchableOpacity
              key={tab.key}
              style={[
                styles.shiftSegmentBtn,
                isSelected && [styles.shiftSegmentBtnActive, { backgroundColor: tab.color }],
              ]}
              onPress={() => setSelectedShift(tab.key)}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.shiftSegmentText,
                  isSelected && styles.shiftSegmentTextActive,
                ]}
              >
                {tab.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* ── 3. 선택된 듀티의 식단 상세 정보 카드 ── */}
      <View style={styles.dietDetailCard}>
        {/* 요약 및 핵심 규칙 */}
        <View style={styles.dietSummaryBox}>
          <Text style={styles.dietSummaryText}>{currentGuide.summary}</Text>
          <View style={styles.coreRuleBox}>
            <Text style={styles.coreRuleLabel}>⚡ 핵심 원칙</Text>
            <Text style={styles.coreRuleText}>{currentGuide.coreRule}</Text>
          </View>
        </View>

        {/* 3단계 타임테이블 식단 리스트 */}
        <Text style={styles.mealsHeading}>타임테이블별 추천 식단</Text>
        <View style={styles.mealStepList}>
          {currentGuide.meals.map((meal, idx) => (
            <View key={idx} style={styles.mealStepCard}>
              <View style={styles.mealStepHeader}>
                <View style={[styles.timingBadge, { backgroundColor: theme.primaryTint }]}>
                  <Text style={[styles.timingBadgeText, { color: theme.primary }]}>
                    {meal.timing}
                  </Text>
                </View>
                <Text style={styles.mealStepName}>{meal.mealName}</Text>
              </View>

              <Text style={styles.mealStepDesc}>{meal.description}</Text>

              {/* 추천 음식 칩 */}
              <View style={styles.foodChipWrap}>
                {meal.recommendedFoods.map((food, fIdx) => (
                  <View key={fIdx} style={styles.foodChip}>
                    <Text style={styles.foodChipText}>🥗 {food}</Text>
                  </View>
                ))}
              </View>
            </View>
          ))}
        </View>

        {/* 수분 & 카페인 가이드 */}
        <View style={styles.careInfoRow}>
          <View style={styles.careInfoBox}>
            <Text style={styles.careInfoTitle}>💧 수분 섭취</Text>
            <Text style={styles.careInfoDesc}>{currentGuide.hydrationRule}</Text>
          </View>

          <View style={styles.careInfoBox}>
            <Text style={styles.careInfoTitle}>☕ 카페인 룰</Text>
            <Text style={styles.careInfoDesc}>{currentGuide.caffeineRule}</Text>
          </View>
        </View>

        {/* 피해야 할 음식 */}
        <View style={styles.avoidBox}>
          <Text style={styles.avoidTitle}>🚫 피해야 할 음식 & 습관</Text>
          {currentGuide.foodsToAvoid.map((avoidItem, aIdx) => (
            <Text key={aIdx} style={styles.avoidItemText}>
              • {avoidItem}
            </Text>
          ))}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 24,
    marginBottom: 16,
  },
  sectionHeaderTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 4,
  },
  sectionHeaderSub: {
    fontSize: 12,
    color: '#6B7280',
    lineHeight: 18,
    marginBottom: 14,
  },
  prescriptionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
    marginBottom: 16,
  },
  prescHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  prescBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  prescBadgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  prescTag: {
    fontSize: 11,
    fontWeight: '600',
    color: '#9CA3AF',
  },
  prescTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 6,
  },
  prescSummary: {
    fontSize: 13,
    color: '#4B5563',
    lineHeight: 19,
  },
  prescDivider: {
    height: 1,
    backgroundColor: '#F3F4F6',
    marginVertical: 12,
  },
  guidelineList: {
    gap: 8,
  },
  guidelineItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  checkBullet: {
    fontSize: 13,
    fontWeight: '800',
    lineHeight: 18,
  },
  guidelineText: {
    flex: 1,
    fontSize: 12,
    color: '#374151',
    lineHeight: 18,
  },
  shiftSegmentRow: {
    flexDirection: 'row',
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    padding: 4,
    marginBottom: 14,
    gap: 4,
  },
  shiftSegmentBtn: {
    flex: 1,
    paddingVertical: 9,
    alignItems: 'center',
    borderRadius: 10,
  },
  shiftSegmentBtnActive: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  shiftSegmentText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#6B7280',
  },
  shiftSegmentTextActive: {
    color: '#FFFFFF',
    fontWeight: '800',
  },
  dietDetailCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  dietSummaryBox: {
    marginBottom: 16,
  },
  dietSummaryText: {
    fontSize: 13,
    color: '#4B5563',
    lineHeight: 19,
    marginBottom: 10,
  },
  coreRuleBox: {
    backgroundColor: '#FFFBEB',
    borderRadius: 10,
    padding: 12,
    borderLeftWidth: 3,
    borderLeftColor: '#F59E0B',
  },
  coreRuleLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#92400E',
    marginBottom: 2,
  },
  coreRuleText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#78350F',
    lineHeight: 17,
  },
  mealsHeading: {
    fontSize: 14,
    fontWeight: '800',
    color: '#1F2937',
    marginBottom: 10,
  },
  mealStepList: {
    gap: 12,
    marginBottom: 16,
  },
  mealStepCard: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  mealStepHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  timingBadge: {
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6,
  },
  timingBadgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  mealStepName: {
    fontSize: 13,
    fontWeight: '700',
    color: '#111827',
  },
  mealStepDesc: {
    fontSize: 12,
    color: '#6B7280',
    lineHeight: 17,
    marginBottom: 10,
  },
  foodChipWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  foodChip: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  foodChipText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#374151',
  },
  careInfoRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 14,
  },
  careInfoBox: {
    flex: 1,
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  careInfoTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 4,
  },
  careInfoDesc: {
    fontSize: 11,
    color: '#4B5563',
    lineHeight: 16,
  },
  avoidBox: {
    backgroundColor: '#FEF2F2',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#FEE2E2',
  },
  avoidTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#DC2626',
    marginBottom: 6,
  },
  avoidItemText: {
    fontSize: 11,
    color: '#B91C1C',
    lineHeight: 17,
  },
});
