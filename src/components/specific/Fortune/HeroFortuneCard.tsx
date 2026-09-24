import React, { useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { COLORS, useAppTheme } from '../../../constants/theme';
import {
  getDailyLuckyInfo,
  getLuckyColorHex,
  cleanLuckyColorName,
} from '../../../utils/dailyFortuneGenerator';

interface HeroFortuneCardProps {
  formattedToday: string;
  overallScore: number;
  isLoading: boolean;
  onRefresh: () => void;
  luckyColor?: string;
  luckyColorHex?: string;
  luckyNumber?: number;
  luckyDirection?: string;
  luckyItem?: string;
  birthDate?: string;
}

export const HeroFortuneCard: React.FC<HeroFortuneCardProps> = ({
  formattedToday,
  overallScore,
  isLoading,
  onRefresh,
  luckyColor,
  luckyColorHex,
  luckyNumber,
  luckyDirection,
  luckyItem,
  birthDate,
}) => {
  const theme = useAppTheme();

  // 오늘 날짜 기준 매일 갱신되는 데일리 행운 기본값
  const dailyLucky = useMemo(() => getDailyLuckyInfo(new Date(), birthDate), [birthDate]);

  const rawColor = luckyColor || dailyLucky.colorName;
  const displayColor = cleanLuckyColorName(rawColor);
  const displayColorHex = luckyColorHex || getLuckyColorHex(displayColor) || dailyLucky.colorHex;
  const displayNumber = luckyNumber !== undefined && luckyNumber !== null ? luckyNumber : dailyLucky.number;
  const displayDirection = luckyDirection || dailyLucky.direction;
  const displayItem = luckyItem || dailyLucky.item;

  return (
    <View style={styles.heroCard}>
      {/* 상단: 날짜 + 행운 지수 점수 (Display 28px/800 토스 미니멀 표기) */}
      <View style={styles.heroTopRow}>
        <View style={styles.heroDateCol}>
          <Text style={styles.heroDate}>{formattedToday}</Text>
          <Text style={styles.heroHeading}>오늘의 행운 지수</Text>
        </View>

        <TouchableOpacity
          style={styles.scoreWrapper}
          onPress={onRefresh}
          disabled={isLoading}
          activeOpacity={0.7}
        >
          {isLoading ? (
            <ActivityIndicator color={theme.primary} size="small" />
          ) : (
            <View style={styles.scoreRow}>
              <Text style={[styles.scoreNumber, { color: theme.primary }]}>{overallScore}</Text>
              <Text style={styles.scoreUnit}>점</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      {/* 구분선 */}
      <View style={styles.divider} />

      {/* 하단: 오늘의 행운 4종 아이템 (HeroFortuneCard 단일 카드 내 통합) */}
      <View style={styles.luckyItemsGrid}>
        {/* 행운 컬러 */}
        <View style={styles.luckyItemRow}>
          <Text style={styles.luckyItemLabel}>행운 컬러</Text>
          <View style={styles.luckyValueRow}>
            <View style={[styles.colorDot, { backgroundColor: displayColorHex }]} />
            <Text style={[styles.luckyValueText, { color: displayColorHex }]}>{displayColor}</Text>
          </View>
        </View>

        <View style={styles.innerDivider} />

        {/* 행운 숫자 */}
        <View style={styles.luckyItemRow}>
          <Text style={styles.luckyItemLabel}>행운 숫자</Text>
          <Text style={styles.luckyValueText}>{displayNumber}</Text>
        </View>

        <View style={styles.innerDivider} />

        {/* 행운 방향 */}
        <View style={styles.luckyItemRow}>
          <Text style={styles.luckyItemLabel}>행운 방향</Text>
          <Text style={styles.luckyValueText}>{displayDirection}</Text>
        </View>

        <View style={styles.innerDivider} />

        {/* 행운 아이템 */}
        <View style={styles.luckyItemRow}>
          <Text style={styles.luckyItemLabel}>추천 아이템</Text>
          <Text style={[styles.luckyValueText, { color: theme.primary }]}>{displayItem}</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  heroCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  heroTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  heroDateCol: {
    gap: 4,
  },
  heroDate: {
    fontSize: 13,
    color: COLORS.textMuted,
    fontWeight: '600',
  },
  heroHeading: {
    fontSize: 20,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  scoreWrapper: {
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  scoreRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 2,
  },
  scoreNumber: {
    fontSize: 28,
    fontWeight: '800',
    lineHeight: 32,
  },
  scoreUnit: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textSecondary,
  },
  divider: {
    height: 1,
    backgroundColor: '#F3F4F6',
    marginVertical: 16,
  },
  luckyItemsGrid: {
    gap: 2,
  },
  luckyItemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 7,
  },
  luckyItemLabel: {
    fontSize: 14,
    color: COLORS.textSecondary,
    fontWeight: '600',
  },
  luckyValueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  colorDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  luckyValueText: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  innerDivider: {
    height: 1,
    backgroundColor: '#F8F9FA',
  },
});
