import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS } from '../../../constants/theme';
import { PaletteIcon, HashIcon, CompassIcon } from '../../common/Icon';

interface LuckyItemsSectionProps {
  color?: string;
  number?: number;
  direction?: string;
}

export const LuckyItemsSection: React.FC<LuckyItemsSectionProps> = ({
  color = '우간다 핑크',
  number = 7,
  direction = '동쪽 (화(火) 기운)',
}) => {
  return (
    <View style={styles.container}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>오늘의 행운</Text>
      </View>
      <View style={styles.luckyCard}>
        {/* 행운 컬러 */}
        <View style={styles.luckyRow}>
          <View style={styles.luckyLeft}>
            <View style={styles.luckyIconWrapper}>
              <PaletteIcon size={18} color={COLORS.primary} />
            </View>
            <Text style={styles.luckyLabel}>행운의 컬러</Text>
          </View>
          <View style={styles.luckyRight}>
            <View style={styles.colorDot} />
            <Text style={styles.luckyValue}>{color}</Text>
          </View>
        </View>

        <View style={styles.luckyDivider} />

        {/* 행운 숫자 */}
        <View style={styles.luckyRow}>
          <View style={styles.luckyLeft}>
            <View style={styles.luckyIconWrapper}>
              <HashIcon size={18} color={COLORS.primary} />
            </View>
            <Text style={styles.luckyLabel}>행운의 숫자</Text>
          </View>
          <Text style={styles.luckyValueText}>{number}</Text>
        </View>

        <View style={styles.luckyDivider} />

        {/* 행운 방향 */}
        <View style={styles.luckyRow}>
          <View style={styles.luckyLeft}>
            <View style={styles.luckyIconWrapper}>
              <CompassIcon size={18} color={COLORS.primary} />
            </View>
            <Text style={styles.luckyLabel}>행운의 방향</Text>
          </View>
          <Text style={styles.luckyValueText}>{direction}</Text>
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
    fontSize: 16,
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
    paddingVertical: 4,
  },
  luckyLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  luckyIconWrapper: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FFF1F4',
    alignItems: 'center',
    justifyContent: 'center',
  },
  luckyLabel: {
    fontSize: 14,
    color: COLORS.textPrimary,
    fontWeight: '600',
  },
  luckyRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  colorDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: COLORS.primary,
  },
  luckyValue: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.primary,
  },
  luckyValueText: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  luckyDivider: {
    height: 1,
    backgroundColor: '#F3F4F6',
    marginVertical: 10,
  },
});

