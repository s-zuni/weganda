import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ShinsalDetected } from '../../../services/manseryeokService';
import { COLORS, NEUTRAL, TINT_COLORS } from '../../../constants/theme';

export interface SajuShinsalCardProps {
  detectedShinsals: ShinsalDetected[];
}

export const SajuShinsalCard: React.FC<SajuShinsalCardProps> = ({
  detectedShinsals,
}) => {
  return (
    <View style={styles.sectionContainer}>
      <View style={styles.sectionTitleRow}>
        <Ionicons name="flash" size={18} color={COLORS.shift.vacation} />
        <Text style={styles.sectionHeaderTitle}>사주에 잠재된 특수 기운 & 신살 (神煞)</Text>
      </View>
      <Text style={styles.sectionHeaderDesc}>
        임상 현장에서 발현되는 귀문관살, 홍염살, 백호대살 등의 작용
      </Text>

      <View style={styles.shinsalList}>
        {detectedShinsals.length > 0 ? (
          detectedShinsals.map((shinsal) => (
            <View key={shinsal.name} style={styles.shinsalCard}>
              <View style={styles.shinsalHeader}>
                <View
                  style={[
                    styles.shinsalBadge,
                    { backgroundColor: shinsal.badgeColor },
                  ]}
                >
                  <Text style={styles.shinsalBadgeText}>{shinsal.name}</Text>
                </View>
                <Text style={styles.shinsalHanja}>{shinsal.hanja}</Text>
                <View style={styles.shinsalTypeTag}>
                  <Text style={styles.shinsalTypeTagText}>{shinsal.type}</Text>
                </View>
              </View>

              <Text style={styles.shinsalSummary}>{shinsal.oneLineSummary}</Text>

              <View style={styles.shinsalDetailBox}>
                <Text style={styles.shinsalDetailLabel}>병원 임상 발현:</Text>
                <Text style={styles.shinsalDetailText}>{shinsal.hospitalImpact}</Text>
              </View>

              <View style={[styles.shinsalDetailBox, { marginTop: 6 }]}>
                <Text style={[styles.shinsalDetailLabel, { color: COLORS.primary }]}>
                  처방 조언:
                </Text>
                <Text style={styles.shinsalDetailText}>{shinsal.clinicalAdvice}</Text>
              </View>
            </View>
          ))
        ) : (
          <View style={styles.emptyShinsalCard}>
            <Text style={styles.emptyShinsalText}>
              특정 흉살이나 극단적 충살 없이, 온화하고 원만한 정인(正印)의 기운이 흐릅니다.
            </Text>
          </View>
        )}
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
  sectionHeaderDesc: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginBottom: 12,
    marginLeft: 24,
  },
  shinsalList: {
    gap: 12,
  },
  shinsalCard: {
    backgroundColor: COLORS.cardBackground,
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  shinsalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  shinsalBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  shinsalBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.onPrimaryText,
  },
  shinsalHanja: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  shinsalTypeTag: {
    marginLeft: 'auto',
    backgroundColor: COLORS.divider,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  shinsalTypeTagText: {
    fontSize: 10,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  shinsalSummary: {
    fontSize: 13,
    fontWeight: '700',
    color: NEUTRAL.gray800,
    marginBottom: 10,
  },
  shinsalDetailBox: {
    backgroundColor: NEUTRAL.gray50,
    borderRadius: 10,
    padding: 10,
  },
  shinsalDetailLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: NEUTRAL.gray600,
    marginBottom: 2,
  },
  shinsalDetailText: {
    fontSize: 12,
    color: NEUTRAL.gray700,
    lineHeight: 17,
  },
  emptyShinsalCard: {
    backgroundColor: NEUTRAL.gray50,
    padding: 16,
    borderRadius: 14,
    alignItems: 'center',
  },
  emptyShinsalText: {
    fontSize: 13,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
});

