import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { ElementRatio } from '../../../mocks/fortuneData';
import { COLORS } from '../../../constants/theme';

interface FiveElementsBarProps {
  elements: ElementRatio[];
}

export const FiveElementsBar: React.FC<FiveElementsBarProps> = ({ elements }) => {
  return (
    <View style={styles.container}>
      {/* ── 1. 오행 누적 수평 막대 그래프 ── */}
      <View style={styles.barTrack}>
        {elements.map((item) => (
          <View
            key={item.element}
            style={[
              styles.barSegment,
              {
                flex: item.percentage,
                backgroundColor: item.color,
              },
            ]}
          />
        ))}
      </View>

      {/* ── 2. 오행 범례 및 수치 칩 ── */}
      <View style={styles.legendGrid}>
        {elements.map((item) => (
          <View key={item.element} style={styles.legendItem}>
            <View style={[styles.dot, { backgroundColor: item.color }]} />
            <Text style={styles.elementName}>{item.element}</Text>
            <Text style={styles.elementPercent}>{item.percentage}%</Text>
          </View>
        ))}
      </View>

      {/* ── 3. 사주 핵심 요약 코멘트 ── */}
      <View style={styles.summaryBox}>
        <Text style={styles.summaryTitle}>🔥 화(火) 기운 우세 사주</Text>
        <Text style={styles.summaryTitle}>화(火) 기운 우세 사주</Text>
        <Text style={styles.summaryDesc}>
          응급 처치와 환자 인터랙션에서 빠른 판단력과 따뜻한 에너지를 발산하는 리더형 간호사 사주입니다.
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginVertical: 8,
  },
  barTrack: {
    flexDirection: 'row',
    height: 18,
    borderRadius: 9,
    overflow: 'hidden',
    backgroundColor: '#F3F4F6',
    marginBottom: 14,
  },
  barSegment: {
    height: '100%',
  },
  legendGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 8,
    marginBottom: 12,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    width: '30%',
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  elementName: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  elementPercent: {
    fontSize: 12,
    fontWeight: '800',
    color: COLORS.textSecondary,
  },
  summaryBox: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 12,
    borderLeftWidth: 3,
    borderLeftColor: COLORS.primary,
  },
  summaryTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 4,
  },
  summaryDesc: {
    fontSize: 12,
    color: COLORS.textSecondary,
    lineHeight: 18,
  },
});

export default FiveElementsBar;

