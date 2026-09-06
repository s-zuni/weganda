import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { COLORS } from '../../../constants/theme';
import { CalculatorIcon } from '../../common/Icon';

interface StudyDrugCalcBannerProps {
  onPress: () => void;
}

export const StudyDrugCalcBanner: React.FC<StudyDrugCalcBannerProps> = ({ onPress }) => {
  return (
    <TouchableOpacity
      style={styles.calcCard}
      onPress={onPress}
      activeOpacity={0.85}
    >
      <View style={styles.calcCardLeft}>
        <View style={styles.calcIconWrapper}>
          <CalculatorIcon size={22} color="#FFFFFF" />
        </View>
        <View style={styles.calcTexts}>
          <Text style={styles.calcTitle}>임상 약물 gtt / cc 점적 계산기</Text>
          <Text style={styles.calcSub}>도파민, 승압제 처방 용량(mcg) ↔ 주입 속도 환산</Text>
        </View>
      </View>
      <View style={styles.calcGoBadge}>
        <Text style={styles.calcGoText}>계산하기 ›</Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  calcCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  calcCardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  calcIconWrapper: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  calcTexts: {
    flex: 1,
  },
  calcTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  calcSub: {
    fontSize: 11,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  calcGoBadge: {
    backgroundColor: '#FFF1F4',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
  },
  calcGoText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.primary,
  },
});

