import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ELEMENT_COLORS, PillarData, SajuAnalysisResult } from '../../../services/manseryeokService';
import { COLORS, NEUTRAL, TINT_COLORS } from '../../../constants/theme';

export interface SajuPillarsCardProps {
  pillars: SajuAnalysisResult['pillars'];
  dayMaster: SajuAnalysisResult['dayMaster'];
}

export const SajuPillarsCard: React.FC<SajuPillarsCardProps> = ({
  pillars,
  dayMaster,
}) => {
  const renderPillarColumn = (
    title: string,
    sub: string,
    pillar: PillarData,
    isDayMaster: boolean = false
  ) => (
    <View style={[styles.pillarColumn, isDayMaster && styles.dayMasterColumn]}>
      <Text style={styles.pillarHeaderTitle}>{title}</Text>
      <Text style={styles.pillarHeaderSub}>{sub}</Text>

      {/* 천간 영역 */}
      <View style={styles.stemBox}>
        <Text style={styles.tenGodText}>{pillar.stemTenGod}</Text>
        <View
          style={[
            styles.charCircle,
            { backgroundColor: ELEMENT_COLORS[pillar.stemElement] },
          ]}
        >
          <Text style={styles.hanjaChar}>{pillar.stemHanja}</Text>
        </View>
        <Text style={styles.koreanChar}>{pillar.stem}</Text>
        <Text style={styles.elementTag}>
          {pillar.stemYinYang} {pillar.stemElement}
        </Text>
      </View>

      {/* 구분선 */}
      <View style={styles.pillarDivider} />

      {/* 지지 영역 */}
      <View style={styles.branchBox}>
        <Text style={styles.tenGodText}>{pillar.branchTenGod}</Text>
        <View
          style={[
            styles.charCircle,
            { backgroundColor: ELEMENT_COLORS[pillar.branchElement] },
          ]}
        >
          <Text style={styles.hanjaChar}>{pillar.branchHanja}</Text>
        </View>
        <Text style={styles.koreanChar}>{pillar.branch}</Text>
        <Text style={styles.elementTag}>
          {pillar.branchYinYang} {pillar.branchElement}
        </Text>
      </View>
    </View>
  );

  return (
    <View style={styles.sectionContainer}>
      <View style={styles.sectionTitleRow}>
        <Ionicons name="grid" size={18} color={COLORS.primary} />
        <Text style={styles.sectionHeaderTitle}>만세력 사주 원국표 (四柱原局)</Text>
      </View>
      <Text style={styles.sectionHeaderDesc}>
        천간과 지지 8글자의 음양오행 및 십신(十神) 정밀 배치
      </Text>

      <View style={styles.pillarsCard}>
        <View style={styles.pillarsRow}>
          {renderPillarColumn('시주 (時柱)', '말년·자녀', pillars.hour)}
          {renderPillarColumn('일주 (日柱)', '본인·일간', pillars.day, true)}
          {renderPillarColumn('월주 (月柱)', '청년·직장', pillars.month)}
          {renderPillarColumn('연주 (年柱)', '초년·가문', pillars.year)}
        </View>

        <View style={styles.dayMasterCallout}>
          <Ionicons name="star" size={16} color={COLORS.primary} />
          <Text style={styles.dayMasterCalloutText}>
            나를 상징하는 일간(본원):{' '}
            <Text style={styles.dayMasterHighlight}>{dayMaster.natureTitle}</Text>
          </Text>
        </View>
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
  pillarsCard: {
    backgroundColor: COLORS.cardBackground,
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  pillarsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  pillarColumn: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 2,
    borderRadius: 12,
  },
  dayMasterColumn: {
    backgroundColor: TINT_COLORS.pinkTint,
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
  pillarHeaderTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: NEUTRAL.gray800,
  },
  pillarHeaderSub: {
    fontSize: 10,
    color: COLORS.textMuted,
    marginBottom: 8,
  },
  stemBox: {
    alignItems: 'center',
  },
  branchBox: {
    alignItems: 'center',
  },
  tenGodText: {
    fontSize: 10,
    fontWeight: '600',
    color: NEUTRAL.gray600,
    marginBottom: 4,
  },
  charCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 2,
  },
  hanjaChar: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.onPrimaryText,
  },
  koreanChar: {
    fontSize: 12,
    fontWeight: '700',
    color: NEUTRAL.gray900,
  },
  elementTag: {
    fontSize: 9,
    color: COLORS.textSecondary,
    marginTop: 1,
  },
  pillarDivider: {
    width: '70%',
    height: 1,
    backgroundColor: COLORS.border,
    marginVertical: 10,
  },
  dayMasterCallout: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: TINT_COLORS.pinkTint,
    padding: 10,
    borderRadius: 10,
    marginTop: 12,
  },
  dayMasterCalloutText: {
    fontSize: 12,
    color: NEUTRAL.gray800,
  },
  dayMasterHighlight: {
    fontWeight: '800',
    color: COLORS.primary,
  },
});

