import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { FiveElementsRatio } from '../../../services/manseryeokService';
import { COLORS, NEUTRAL, TINT_COLORS } from '../../../constants/theme';

export interface SajuFiveElementsCardProps {
  fiveElements: FiveElementsRatio[];
}

export const SajuFiveElementsCard: React.FC<SajuFiveElementsCardProps> = ({
  fiveElements,
}) => {
  return (
    <View style={styles.sectionContainer}>
      <View style={styles.sectionTitleRow}>
        <Ionicons name="pie-chart" size={18} color={COLORS.status.success} />
        <Text style={styles.sectionHeaderTitle}>오행(五行) 에너지 밸런스</Text>
      </View>

      <View style={styles.fiveElementsCard}>
        {fiveElements.map((el) => (
          <View key={el.rawName} style={styles.elementRow}>
            <View style={styles.elementNameWrap}>
              <View style={[styles.elementDot, { backgroundColor: el.color }]} />
              <Text style={styles.elementNameText}>{el.element}</Text>
              <View
                style={[
                  styles.elementStatusBadge,
                  el.status === '과다' && styles.statusOver,
                  el.status === '결핍' && styles.statusDeficient,
                ]}
              >
                <Text style={styles.elementStatusText}>{el.status}</Text>
              </View>
            </View>

            <View style={styles.barTrack}>
              <View
                style={[
                  styles.barFill,
                  {
                    width: `${Math.max(el.percentage, 5)}%`,
                    backgroundColor: el.color,
                  },
                ]}
              />
            </View>
            <Text style={styles.percentageText}>{el.percentage}%</Text>
          </View>
        ))}
      </View>
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
  fiveElementsCard: {
    backgroundColor: COLORS.cardBackground,
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: 12,
  },
  elementRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  elementNameWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    width: 86,
    gap: 4,
  },
  elementDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  elementNameText: {
    fontSize: 13,
    fontWeight: '600',
    color: NEUTRAL.gray800,
  },
  elementStatusBadge: {
    backgroundColor: COLORS.divider,
    paddingHorizontal: 4,
    paddingVertical: 2,
    borderRadius: 4,
  },
  statusOver: {
    backgroundColor: TINT_COLORS.redTintBorder,
  },
  statusDeficient: {
    backgroundColor: TINT_COLORS.blueTintBorder,
  },
  elementStatusText: {
    fontSize: 9,
    fontWeight: '700',
    color: NEUTRAL.gray600,
  },
  barTrack: {
    flex: 1,
    height: 8,
    backgroundColor: COLORS.divider,
    borderRadius: 4,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    borderRadius: 4,
  },
  percentageText: {
    fontSize: 12,
    fontWeight: '700',
    color: NEUTRAL.gray600,
    width: 32,
    textAlign: 'right',
  },
});

