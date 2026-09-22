import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import {
  PaletteIcon,
  FortuneIcon,
  ChartBarIcon,
  BotIcon,
  ShieldCheckIcon,
} from '../../common/Icon';
import { COLORS, NEUTRAL, TINT_COLORS } from '../../../constants/theme';

export interface MembershipBenefitsListProps {
  isPremium: boolean;
}

export const MEMBERSHIP_BENEFITS = [
  {
    key: 'theme',
    title: '앱 커스텀 컬러 설정',
    description: '세이지, 더스티로즈, 차콜 등 8종\n나만의 프리미엄 테마 컬러를 설정하세요',
    freeLimit: '핑크, 네이비 무료 제공',
    iconColor: '#9B51E0',
    Icon: PaletteIcon,
  },
  {
    key: 'fortune',
    title: '사주 서비스 무제한 제공',
    description: '매달 횟수 제한 없이\n간호 운세와 정밀 사주를 확인하세요',
    freeLimit: '월 5회 제한',
    iconColor: COLORS.primary,
    Icon: FortuneIcon,
  },
  {
    key: 'salary',
    title: '야간/휴일 수당 및 월급 예측기',
    description: 'D/E/N 근무 패턴 기반으로\n다음 달 예상 월급을 자동 계산해요',
    freeLimit: 'weganda+ 전용',
    iconColor: COLORS.status.warning,
    Icon: ChartBarIcon,
  },
  {
    key: 'ai',
    title: '약물 계산기 & Ask AI 무제한',
    description: '복잡한 약물 용량 계산 프리셋과\nAI 임상 어시스턴트를 무제한 사용',
    freeLimit: '일일 3회 제한',
    iconColor: COLORS.status.info,
    Icon: BotIcon,
  },
  {
    key: 'burnout',
    title: '스마트 듀티 건강 & 번아웃 위험도 AI 분석',
    description: 'N-O-D 패턴, 수면 부채, 연속 근무 피로도를\nAI가 분석하여 회복 골든타임을 알려드려요',
    freeLimit: 'weganda+ 전용',
    iconColor: COLORS.status.success,
    Icon: ShieldCheckIcon,
  },
];

export const MembershipBenefitsList: React.FC<MembershipBenefitsListProps> = ({
  isPremium,
}) => {
  return (
    <View style={styles.benefitsSection}>
      <Text style={styles.sectionTitle}>프리미엄 5대 혜택</Text>

      {isPremium && (
        <View style={styles.premiumSuccessCard}>
          <View style={styles.premiumSuccessIcon}>
            <ShieldCheckIcon size={24} color={COLORS.status.success} />
          </View>
          <View style={styles.premiumSuccessTexts}>
            <Text style={styles.premiumSuccessTitle}>weganda+ 회원이시네요! 🎉</Text>
            <Text style={styles.premiumSuccessDesc}>모든 프리미엄 기능을 이용하실 수 있습니다</Text>
          </View>
        </View>
      )}

      <View style={styles.cardsContainer}>
        {MEMBERSHIP_BENEFITS.map((benefit) => {
          const IconComponent = benefit.Icon;
          return (
            <View key={benefit.key} style={styles.benefitCard}>
              <View style={styles.cardHeader}>
                <View
                  style={[
                    styles.iconCircle,
                    { backgroundColor: `${benefit.iconColor}1A` },
                  ]}
                >
                  <IconComponent size={24} color={benefit.iconColor} />
                </View>
                <View style={styles.cardTexts}>
                  <Text style={styles.cardTitle}>{benefit.title}</Text>
                  <Text style={styles.cardDesc}>{benefit.description}</Text>
                </View>
              </View>
              {benefit.freeLimit && (
                <View style={styles.badgeContainer}>
                  <Text style={styles.badgeText}>무료: {benefit.freeLimit}</Text>
                </View>
              )}
            </View>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  benefitsSection: {
    backgroundColor: COLORS.background,
    paddingHorizontal: 20,
    paddingTop: 28,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 20,
  },
  premiumSuccessCard: {
    flexDirection: 'row',
    backgroundColor: TINT_COLORS.greenTint,
    padding: 16,
    borderRadius: 16,
    marginBottom: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.status.success,
  },
  premiumSuccessIcon: {
    marginRight: 12,
  },
  premiumSuccessTexts: {
    flex: 1,
  },
  premiumSuccessTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: TINT_COLORS.greenTextDark,
    marginBottom: 4,
  },
  premiumSuccessDesc: {
    fontSize: 14,
    color: TINT_COLORS.greenTextMid,
  },
  cardsContainer: {
    flexDirection: 'column',
    gap: 12,
  },
  benefitCard: {
    backgroundColor: COLORS.cardBackground,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  cardTexts: {
    flex: 1,
    justifyContent: 'center',
  },
  cardTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 4,
  },
  cardDesc: {
    fontSize: 15,
    color: COLORS.textSecondary,
    lineHeight: 21,
  },
  badgeContainer: {
    alignSelf: 'flex-start',
    backgroundColor: TINT_COLORS.pinkTint,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    marginLeft: 56,
  },
  badgeText: {
    fontSize: 13,
    color: COLORS.primary,
    fontWeight: '600',
  },
});

