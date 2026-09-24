import React, { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS } from '../../../constants/theme';
import { getDailyLuckyInfo, getLuckyColorHex, cleanLuckyColorName } from '../../../utils/dailyFortuneGenerator';

interface LuckyItemsSectionProps {
  color?: string;
  colorHex?: string;
  number?: number;
  direction?: string;
  item?: string;
  birthDate?: string;
}

export const LuckyItemsSection: React.FC<LuckyItemsSectionProps> = ({
  color,
  colorHex,
  number,
  direction,
  item,
  birthDate,
}) => {
  // 오늘 날짜 기준 매일 갱신되는 데일리 행운 기본값
  const dailyLucky = useMemo(() => getDailyLuckyInfo(new Date(), birthDate), [birthDate]);

  const rawColor = color || dailyLucky.colorName;
  const displayColor = cleanLuckyColorName(rawColor);
  const displayColorHex = colorHex || getLuckyColorHex(displayColor) || dailyLucky.colorHex;
  const displayNumber = number !== undefined && number !== null ? number : dailyLucky.number;
  const displayDirection = direction || dailyLucky.direction;
  const displayItem = item || dailyLucky.item;

  return (
    <View style={styles.container}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>오늘의 행운</Text>
      </View>
      <View style={styles.luckyCard}>
        {/* 행운 컬러 */}
        <View style={styles.luckyRow}>
          <View style={styles.luckyLeft}>
            <Text style={styles.luckyLabel}>🎨 행운의 컬러</Text>
          </View>
          <View style={styles.luckyRight}>
            <View style={[styles.colorDot, { backgroundColor: displayColorHex }]} />
            <Text style={[styles.luckyValue, { color: displayColorHex }]}>{displayColor}</Text>
          </View>
        </View>

        <View style={styles.luckyDivider} />

        {/* 행운 숫자 */}
        <View style={styles.luckyRow}>
          <View style={styles.luckyLeft}>
            <Text style={styles.luckyLabel}>🔢 행운의 숫자</Text>
          </View>
          <Text style={styles.luckyValueText}>{displayNumber}</Text>
        </View>

        <View style={styles.luckyDivider} />

        {/* 행운 방향 */}
        <View style={styles.luckyRow}>
          <View style={styles.luckyLeft}>
            <Text style={styles.luckyLabel}>🧭 행운의 방향</Text>
          </View>
          <Text style={styles.luckyValueText}>{displayDirection}</Text>
        </View>

        <View style={styles.luckyDivider} />

        {/* 행운의 간호 아이템 */}
        <View style={styles.luckyRow}>
          <View style={styles.luckyLeft}>
            <Text style={styles.luckyLabel}>✨ 행운의 임상 아이템</Text>
          </View>
          <Text style={styles.luckyItemText}>{displayItem}</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
  },
  sectionHeader: {
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  luckyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  luckyRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
  },
  luckyLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  luckyLabel: {
    fontSize: 15,
    color: COLORS.textPrimary,
    fontWeight: '700',
  },
  luckyRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  colorDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
  },
  luckyValue: {
    fontSize: 15,
    fontWeight: '700',
  },
  luckyValueText: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  luckyItemText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#2563EB',
  },
  luckyDivider: {
    height: 1,
    backgroundColor: '#F3F4F6',
    marginVertical: 8,
  },
});
