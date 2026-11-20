import React, { useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Linking,
} from 'react-native';
import { COLORS, NEUTRAL, useAppTheme, type ThemeColors } from '../../../constants/theme';
import { OFFICIAL_MEDICAL_CITATIONS, MEDICAL_DISCLAIMER_TEXT } from '../../../constants/medicalCitations';
import { BookOpenIcon } from '../../common/Icon';
import { SwipeableBottomSheet, BottomSheetScrollView } from '../../common/SwipeableBottomSheet';

interface DrugCalculatorModalProps {
  visible: boolean;
  onClose: () => void;
}

const UNIT_CONVERSION_ROWS = [
  { from: '1 kg', to: '1,000 g', note: '질량 기본 단위' },
  { from: '1 g', to: '1,000 mg', note: '밀리그램 환산' },
  { from: '1 mg', to: '1,000 mcg (μg)', note: '마이크로그램 환산' },
  { from: '1 L', to: '1,000 mL (cc)', note: '부피 기본 단위' },
  { from: '1 hr', to: '60 min (3,600 sec)', note: '시간 단위 환산' },
];

const FORMULA_CARDS = [
  {
    title: '1. 비례식(Ratio & Proportion) 기본 원리',
    formula: 'A : B = C : x  →  x = (B × C) ÷ A',
    desc: '국가시험 기초 간호 산수 문제 풀이 시, 양변의 단위(g, mg, mL)를 먼저 통일한 후 내항의 곱과 외항의 곱이 같음을 이용합니다.',
  },
  {
    title: '2. 시간당 유량(Flow Rate) 교과서 개념',
    formula: '시간당 유량(mL/hr) = 총 부피(mL) ÷ 총 시간(hr)',
    desc: '일정한 부피를 정해진 시간 동안 균등하게 나눌 때 사용하는 기본 나눗셈 공식입니다.',
  },
  {
    title: '3. 수액 세트 점적계수(Drop Factor) 정의',
    formula: '표준 세트: 20 gtt/mL  |  미세 세트: 60 gtt/mL',
    desc: '1 mL를 구성하는 방울 수(gtt)를 뜻하는 규격 상수입니다. 분당 방울수를 이해할 때는 시간당 유량(mL/hr)에 점적계수를 곱한 뒤 60분으로 나누어 개념을 학습합니다.',
  },
  {
    title: '4. 교대근무 수면·휴식 시간 배분 팁',
    formula: '권장 최소 수면: 7시간 이상 | 나이트 전 낮잠: 90~120분',
    desc: '3교대 근무 시 퇴근 직후 햇빛 노출을 최소화하고 일정한 수면 블록을 확보하면 생체 리듬 회복에 도움이 됩니다.',
  },
];

/**
 * Guideline 1.4.2 준수 (전략 A):
 * 약물 투여량(Drug Dosage)을 계산하는 대화형 계산기 기능을 완전히 제거하고,
 * 간호학 기초 SI 단위 환산표 및 국가고시 대비 학습 공식 노트(정적 레퍼런스)로 제공한다.
 */
export const DrugCalculatorModal: React.FC<DrugCalculatorModalProps> = ({
  visible,
  onClose,
}) => {
  const theme = useAppTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  return (
    <SwipeableBottomSheet visible={visible} onClose={onClose} height="92%">
      <View style={styles.header}>
        <View style={styles.headerTitleRow}>
          <BookOpenIcon size={20} color={theme.primary} />
          <Text style={styles.headerTitle}>기초 단위 환산 & 공식 노트</Text>
        </View>

        <TouchableOpacity onPress={onClose} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <Text style={styles.closeText}>닫기</Text>
        </TouchableOpacity>
      </View>

      <BottomSheetScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.introBanner}>
          <Text style={styles.introTitle}>간호국가고시 대비 기초 학습 레퍼런스</Text>
          <Text style={styles.introDesc}>
            기초 SI 단위 환산표와 비례식 개념을 복습할 수 있는 학습용 요약 노트입니다. 실제 임상 업무에서는 반드시 소속 기관의 공식 지침을 확인하세요.
          </Text>
        </View>

        <Text style={styles.sectionLabel}>📐 SI 기본 단위 환산표</Text>
        <View style={styles.tableCard}>
          {UNIT_CONVERSION_ROWS.map((row, idx) => (
            <View
              key={row.from}
              style={[
                styles.tableRow,
                idx < UNIT_CONVERSION_ROWS.length - 1 && styles.tableRowBorder,
              ]}
            >
              <Text style={styles.tableFrom}>{row.from}</Text>
              <Text style={styles.tableEq}>=</Text>
              <Text style={styles.tableTo}>{row.to}</Text>
              <Text style={styles.tableNote}>{row.note}</Text>
            </View>
          ))}
        </View>

        <Text style={styles.sectionLabel}>📖 핵심 학습 공식 정리</Text>
        {FORMULA_CARDS.map((card) => (
          <View key={card.title} style={styles.formulaCard}>
            <Text style={styles.formulaTitle}>{card.title}</Text>
            <View style={styles.formulaBox}>
              <Text style={styles.formulaText}>{card.formula}</Text>
            </View>
            <Text style={styles.formulaDesc}>{card.desc}</Text>
          </View>
        ))}

        {/* 공식 의학 출처 및 면책 조항 */}
        <View style={styles.citationSection}>
          <Text style={styles.citationSectionTitle}>공식 학습 지침 및 출처</Text>
          <Text style={styles.disclaimerText}>{MEDICAL_DISCLAIMER_TEXT}</Text>

          <View style={styles.citationList}>
            {OFFICIAL_MEDICAL_CITATIONS.filter(
              (c) => c.category === '약물' || c.category === '간호술기'
            ).map((cit) => (
              <TouchableOpacity
                key={cit.id}
                style={styles.citationCard}
                onPress={() => Linking.openURL(cit.url)}
                activeOpacity={0.7}
              >
                <View style={styles.citationBadge}>
                  <Text style={styles.citationBadgeText}>{cit.agency}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.citationTitle}>{cit.title}</Text>
                  <Text style={styles.citationDesc}>{cit.description}</Text>
                  <Text style={styles.citationUrl}>{cit.url} ↗</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </BottomSheetScrollView>
    </SwipeableBottomSheet>
  );
};

const createStyles = (theme: ThemeColors) =>
  StyleSheet.create({
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 20,
      paddingTop: 6,
      paddingBottom: 14,
      borderBottomWidth: 1,
      borderBottomColor: '#F3F4F6',
    },
    headerTitleRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    headerTitle: {
      fontSize: 17,
      fontWeight: '800',
      color: COLORS.textPrimary,
    },
    closeText: {
      fontSize: 15,
      fontWeight: '600',
      color: COLORS.textMuted,
    },
    scroll: {
      flex: 1,
    },
    scrollContent: {
      padding: 20,
      paddingBottom: 40,
    },
    introBanner: {
      backgroundColor: theme.primaryTint,
      borderRadius: 16,
      padding: 16,
      marginBottom: 20,
      borderWidth: 1,
      borderColor: theme.primaryTintBorder,
    },
    introTitle: {
      fontSize: 14,
      fontWeight: '800',
      color: theme.primary,
      marginBottom: 4,
    },
    introDesc: {
      fontSize: 12.5,
      color: COLORS.textSecondary,
      lineHeight: 18,
    },
    sectionLabel: {
      fontSize: 15,
      fontWeight: '800',
      color: COLORS.textPrimary,
      marginBottom: 10,
      marginTop: 4,
    },
    tableCard: {
      backgroundColor: '#FFFFFF',
      borderRadius: 16,
      paddingHorizontal: 16,
      paddingVertical: 6,
      marginBottom: 22,
      borderWidth: 1,
      borderColor: COLORS.border,
    },
    tableRow: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 11,
      gap: 8,
    },
    tableRowBorder: {
      borderBottomWidth: 1,
      borderBottomColor: '#F3F4F6',
    },
    tableFrom: {
      width: 48,
      fontSize: 13,
      fontWeight: '700',
      color: COLORS.textPrimary,
    },
    tableEq: {
      fontSize: 13,
      color: COLORS.textMuted,
    },
    tableTo: {
      flex: 1,
      fontSize: 13.5,
      fontWeight: '800',
      color: theme.primary,
    },
    tableNote: {
      fontSize: 11.5,
      color: COLORS.textMuted,
    },
    formulaCard: {
      backgroundColor: NEUTRAL.gray50,
      borderRadius: 16,
      padding: 15,
      marginBottom: 12,
      borderWidth: 1,
      borderColor: COLORS.border,
    },
    formulaTitle: {
      fontSize: 14,
      fontWeight: '800',
      color: COLORS.textPrimary,
      marginBottom: 8,
    },
    formulaBox: {
      backgroundColor: '#FFFFFF',
      borderRadius: 10,
      paddingHorizontal: 12,
      paddingVertical: 9,
      marginBottom: 8,
      borderWidth: 1,
      borderColor: '#E5E7EB',
    },
    formulaText: {
      fontSize: 13,
      fontWeight: '700',
      color: theme.primary,
    },
    formulaDesc: {
      fontSize: 12.5,
      color: COLORS.textSecondary,
      lineHeight: 18,
    },
    citationSection: {
      marginTop: 14,
      backgroundColor: '#F8FAFC',
      borderRadius: 16,
      padding: 16,
      borderWidth: 1,
      borderColor: '#E2E8F0',
    },
    citationSectionTitle: {
      fontSize: 14,
      fontWeight: '800',
      color: COLORS.textPrimary,
      marginBottom: 6,
    },
    disclaimerText: {
      fontSize: 11.5,
      color: COLORS.textSecondary,
      lineHeight: 17,
      marginBottom: 12,
    },
    citationList: {
      gap: 8,
    },
    citationCard: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      backgroundColor: '#FFFFFF',
      padding: 11,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: '#E2E8F0',
      gap: 10,
    },
    citationBadge: {
      backgroundColor: '#EFF6FF',
      paddingHorizontal: 7,
      paddingVertical: 3,
      borderRadius: 6,
    },
    citationBadgeText: {
      fontSize: 10.5,
      fontWeight: '700',
      color: '#2563EB',
    },
    citationTitle: {
      fontSize: 12.5,
      fontWeight: '700',
      color: COLORS.textPrimary,
      marginBottom: 2,
    },
    citationDesc: {
      fontSize: 11,
      color: COLORS.textSecondary,
      marginBottom: 3,
    },
    citationUrl: {
      fontSize: 11,
      color: '#2563EB',
      fontWeight: '600',
    },
  });

export default DrugCalculatorModal;
