import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS } from '../../../constants/theme';

interface FortuneGaugeProps {
  score: number; // 0 ~ 100
  title?: string;
  subtitle?: string;
  badgeLabel?: string;
  color?: string;
}

export const FortuneGauge: React.FC<FortuneGaugeProps> = ({
  score,
  title,
  subtitle,
  badgeLabel = '궁합 지수',
  color = COLORS.primary,
}) => {
  return (
    <View style={styles.container}>
      <View style={styles.topRow}>
        <View>
          {title && <Text style={styles.title}>{title}</Text>}
          {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
        </View>

        <View style={[styles.scoreBadge, { backgroundColor: color }]}>
          <Text style={styles.scoreNumber}>{score}</Text>
          <Text style={styles.scoreUnit}>점</Text>
        </View>
      </View>

      {/* ── 프로그레스 바 게이지 ── */}
      <View style={styles.track}>
        <View
          style={[
            styles.fill,
            {
              width: `${Math.min(Math.max(score, 0), 100)}%`,
              backgroundColor: color,
            },
          ]}
        />
      </View>

      <View style={styles.bottomLabels}>
        <Text style={styles.minMaxText}>0</Text>
        <Text style={styles.ratingBadgeText}>{badgeLabel}: {score >= 90 ? '최상(Best)' : score >= 80 ? '우수(Good)' : '양호(Normal)'}</Text>
        <Text style={styles.minMaxText}>100</Text>
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
    marginVertical: 6,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  title: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  subtitle: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  scoreBadge: {
    flexDirection: 'row',
    alignItems: 'baseline',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 2,
  },
  scoreNumber: {
    fontSize: 18,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  scoreUnit: {
    fontSize: 12,
    fontWeight: '700',
    color: 'rgba(255, 255, 255, 0.9)',
  },
  track: {
    height: 10,
    borderRadius: 5,
    backgroundColor: '#F3F4F6',
    overflow: 'hidden',
    marginBottom: 8,
  },
  fill: {
    height: '100%',
    borderRadius: 5,
  },
  bottomLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  minMaxText: {
    fontSize: 10,
    fontWeight: '600',
    color: COLORS.textMuted,
  },
  ratingBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.textSecondary,
  },
});

export default FortuneGauge;

