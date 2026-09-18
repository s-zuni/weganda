import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AnalysisSection } from '../../../utils/sajuAnalysisGenerator';
import { COLORS, NEUTRAL, TINT_COLORS } from '../../../constants/theme';

export interface SajuReportContentCardProps {
  sections: AnalysisSection[];
  directAdvice: {
    title: string;
    warning: string;
    actionRule: string;
  };
}

export const SajuReportContentCard: React.FC<SajuReportContentCardProps> = ({
  sections,
  directAdvice,
}) => {
  return (
    <>
      {/* 5. 50년 명인의 1,000자+ 심층 분석 리포트 본문 */}
      <View style={styles.sectionContainer}>
        <View style={styles.sectionTitleRow}>
          <Ionicons name="book" size={18} color={NEUTRAL.gray900} />
          <Text style={styles.sectionHeaderTitle}>50년 명인의 심층 명리학·심리 리포트</Text>
        </View>

        {sections.map((section, idx) => (
          <View key={section.title} style={styles.reportSectionCard}>
            <View style={styles.reportSectionHeader}>
              <View
                style={[
                  styles.reportSectionBadge,
                  { backgroundColor: section.badgeColor },
                ]}
              >
                <Text style={styles.reportSectionBadgeText}>{section.badge}</Text>
              </View>
              <Text style={styles.reportSectionTitle}>
                {idx + 1}. {section.title}
              </Text>
            </View>

            <Text style={styles.reportSectionContent}>{section.content}</Text>

            {section.keyPoints && (
              <View style={styles.keyPointsBox}>
                {section.keyPoints.map((point) => (
                  <View key={point} style={styles.keyPointRow}>
                    <Ionicons name="checkmark-circle" size={15} color={section.badgeColor} />
                    <Text style={styles.keyPointText}>{point}</Text>
                  </View>
                ))}
              </View>
            )}
          </View>
        ))}
      </View>

      {/* 6. 명인의 최종 직언 및 행동 수칙 */}
      <View style={styles.directAdviceCard}>
        <View style={styles.directAdviceHeader}>
          <Ionicons name="alert-circle" size={20} color={COLORS.primary} />
          <Text style={styles.directAdviceTitle}>{directAdvice.title}</Text>
        </View>

        <View style={styles.adviceRow}>
          <Text style={styles.adviceLabel}>경고(禁忌):</Text>
          <Text style={styles.adviceWarnText}>{directAdvice.warning}</Text>
        </View>

        <View style={[styles.adviceRow, { marginTop: 8 }]}>
          <Text style={[styles.adviceLabel, { color: COLORS.status.success }]}>처방(行動):</Text>
          <Text style={styles.adviceActionText}>{directAdvice.actionRule}</Text>
        </View>
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  sectionContainer: {
    marginBottom: 24,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  sectionHeaderTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: NEUTRAL.gray900,
  },
  reportSectionCard: {
    backgroundColor: COLORS.cardBackground,
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 16,
  },
  reportSectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  reportSectionBadge: {
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6,
  },
  reportSectionBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.onPrimaryText,
  },
  reportSectionTitle: {
    fontSize: 16.5,
    fontWeight: '800',
    color: NEUTRAL.gray900,
    flex: 1,
  },
  reportSectionContent: {
    fontSize: 15,
    color: NEUTRAL.gray700,
    lineHeight: 24,
  },
  keyPointsBox: {
    backgroundColor: NEUTRAL.gray50,
    borderRadius: 12,
    padding: 12,
    marginTop: 12,
    gap: 6,
  },
  keyPointRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  keyPointText: {
    fontSize: 13,
    fontWeight: '600',
    color: NEUTRAL.gray800,
    lineHeight: 18,
    flex: 1,
  },
  directAdviceCard: {
    backgroundColor: TINT_COLORS.pinkTint,
    borderRadius: 20,
    padding: 18,
    borderWidth: 1.5,
    borderColor: COLORS.primary,
    marginBottom: 24,
  },
  directAdviceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 12,
  },
  directAdviceTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: TINT_COLORS.statusRejectedText,
  },
  adviceRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 6,
  },
  adviceLabel: {
    fontSize: 12,
    fontWeight: '800',
    color: COLORS.status.error,
    width: 64,
  },
  adviceWarnText: {
    flex: 1,
    fontSize: 13,
    fontWeight: '600',
    color: NEUTRAL.gray700,
    lineHeight: 18,
  },
  adviceActionText: {
    flex: 1,
    fontSize: 13,
    fontWeight: '600',
    color: TINT_COLORS.greenTextDark,
    lineHeight: 18,
  },
});

