import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { COLORS } from '../../../constants/theme';

interface StudyDrugCalcBannerProps {
  onPress: () => void;
}

import { WegandaPlusTag } from '../../common/WegandaPlusTag';
import Svg, { Path, Rect } from 'react-native-svg';

export const StudyDrugCalcBanner: React.FC<StudyDrugCalcBannerProps> = ({ onPress }) => {
  return (
    <TouchableOpacity
      style={styles.calcCard}
      onPress={onPress}
      activeOpacity={0.85}
    >
      <View style={styles.calcCardLeft}>
        <View style={styles.iconBox}>
          <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
            <Rect x="4" y="2" width="16" height="20" rx="3" stroke="#4E5968" strokeWidth="2" />
            <Rect x="7" y="5" width="10" height="4" rx="1" fill="#E2E8F0" />
            <Path d="M8 12H10M14 12H16M8 16H10M14 16H16" stroke="#4E5968" strokeWidth="2" strokeLinecap="round" />
          </Svg>
        </View>
        <View style={styles.calcTexts}>
          <View style={styles.titleRow}>
            <Text style={styles.calcTitle}>임상 약물 gtt / cc 계산기</Text>
            <WegandaPlusTag />
          </View>
          <Text style={styles.calcSub}>승압제 · 수액 처방 용량(mcg) ↔ 주입 속도 환산</Text>
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
    flex: 1,
  },
  iconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#F8F9FA',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  calcTexts: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  calcTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#191F28',
  },
  calcSub: {
    fontSize: 13,
    color: COLORS.textMuted,
    marginTop: 3,
  },
  calcGoBadge: {
    backgroundColor: '#FFF1F4',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
  },
  calcGoText: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.primary,
  },
});

