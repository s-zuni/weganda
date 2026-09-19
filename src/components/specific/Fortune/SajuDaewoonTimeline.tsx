import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SajuAnalysisResult } from '../../../services/manseryeokService';
import { COLORS, NEUTRAL, TINT_COLORS } from '../../../constants/theme';

export interface SajuDaewoonTimelineProps {
  daewoon: SajuAnalysisResult['daewoon'];
}

export const SajuDaewoonTimeline: React.FC<SajuDaewoonTimelineProps> = ({
  daewoon,
}) => {
  return (
    <View style={styles.sectionContainer}>
      <View style={styles.sectionTitleRow}>
        <Ionicons name="calendar" size={18} color={COLORS.status.info} />
        <Text style={styles.sectionHeaderTitle}>10년 대운(大運)의 인생 운로</Text>
      </View>
      <Text style={styles.sectionHeaderDesc}>
        {daewoon.startAge}세부터 시작하는 {daewoon.isForward ? '순행(順行)' : '역행(逆行)'} 운로 (현재 대운 강조)
      </Text>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.daewoonScroll}
      >
        {daewoon.pillars.map((item) => (
          <View
            key={item.age}
            style={[
              styles.daewoonItem,
              item.isCurrent && styles.daewoonItemCurrent,
            ]}
          >
            {item.isCurrent && (
              <View style={styles.currentIndicatorBadge}>
                <Text style={styles.currentIndicatorText}>현재 대운</Text>
              </View>
            )}
            <Text
              style={[
                styles.daewoonAge,
                item.isCurrent && styles.daewoonAgeCurrent,
              ]}
            >
              {item.age}세~
            </Text>
            <Text
              style={[
                styles.daewoonPillar,
                item.isCurrent && styles.daewoonPillarCurrent,
              ]}
            >
              {item.korean}
            </Text>
          </View>
        ))}
      </ScrollView>
    </View>
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
  sectionHeaderDesc: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginBottom: 12,
    marginLeft: 24,
  },
  daewoonScroll: {
    flexDirection: 'row',
  },
  daewoonItem: {
    width: 68,
    backgroundColor: NEUTRAL.gray50,
    borderRadius: 14,
    padding: 12,
    alignItems: 'center',
    marginRight: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  daewoonItemCurrent: {
    backgroundColor: TINT_COLORS.blueTint,
    borderColor: COLORS.status.info,
  },
  currentIndicatorBadge: {
    backgroundColor: COLORS.status.info,
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 4,
    marginBottom: 4,
  },
  currentIndicatorText: {
    fontSize: 8,
    fontWeight: '700',
    color: COLORS.onPrimaryText,
  },
  daewoonAge: {
    fontSize: 11,
    color: COLORS.textSecondary,
    fontWeight: '600',
  },
  daewoonAgeCurrent: {
    color: COLORS.status.info,
  },
  daewoonPillar: {
    fontSize: 16,
    fontWeight: '800',
    color: NEUTRAL.gray900,
    marginTop: 4,
  },
  daewoonPillarCurrent: {
    color: COLORS.status.info,
  },
});

