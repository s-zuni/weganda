import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { COLORS } from '../../../constants/theme';

interface LandingPricingProps {
  onSelectPlan: (plan: 'free' | 'plus') => void;
}

export const LandingPricing: React.FC<LandingPricingProps> = ({ onSelectPlan }) => {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');

  return (
    <View style={styles.container} nativeID="pricing">
      <View style={styles.inner}>
        <View style={styles.header}>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>투명하고 합리적인 요금제</Text>
          </View>
          <Text style={styles.title}>내게 꼭 맞는 플랜을 선택하세요</Text>
          <Text style={styles.subtitle}>
            기본적인 듀티 관리는 평생 무료이며, 더 깊은 임상 서포트와 힐링은 weganda+로 경험할 수 있습니다.
          </Text>

          {/* Billing Cycle Switcher */}
          <View style={styles.cycleSwitcher}>
            <TouchableOpacity
              style={[styles.cycleBtn, billingCycle === 'monthly' && styles.cycleBtnActive]}
              onPress={() => setBillingCycle('monthly')}
              activeOpacity={0.8}
            >
              <Text
                style={[
                  styles.cycleBtnText,
                  billingCycle === 'monthly' && styles.cycleBtnTextActive,
                ]}
              >
                월간 결제
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.cycleBtn, billingCycle === 'yearly' && styles.cycleBtnActive]}
              onPress={() => setBillingCycle('yearly')}
              activeOpacity={0.8}
            >
              <Text
                style={[
                  styles.cycleBtnText,
                  billingCycle === 'yearly' && styles.cycleBtnTextActive,
                ]}
              >
                연간 결제 (2개월 무료 ✨)
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Pricing Cards Grid */}
        <View style={styles.grid}>
          {/* Free Plan */}
          <View style={styles.card}>
            <View style={styles.planHeader}>
              <Text style={styles.planName}>Weganda Free</Text>
              <Text style={styles.planDesc}>3교대 근무표 관리가 필요한 모든 간호사</Text>
              <View style={styles.priceRow}>
                <Text style={styles.priceAmount}>₩0</Text>
                <Text style={styles.pricePeriod}>/ 평생 무료</Text>
              </View>
            </View>

            <TouchableOpacity
              style={styles.planBtnSecondary}
              onPress={() => onSelectPlan('free')}
              activeOpacity={0.85}
            >
              <Text style={styles.planBtnSecondaryText}>지금 무료로 시작하기</Text>
            </TouchableOpacity>

            <View style={styles.featureList}>
              <Text style={styles.featureListTitle}>기본 제공 혜택</Text>
              {[
                'D/E/N/O 3교대 근무표 무제한 등록',
                '월간 캘린더 및 주간 스트립 뷰',
                '간호사 익명 커뮤니티 전 게시판 이용',
                '일일 듀티 운세 (월 5회 무료)',
                '동기 듀티 친구 연동 (최대 3명)',
                '비바 코랄 핑크 기본 테마',
              ].map((feat, i) => (
                <View key={i} style={styles.featureItem}>
                  <Text style={styles.checkIcon}>✓</Text>
                  <Text style={styles.featureText}>{feat}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* Plus Plan (Featured) */}
          <View style={[styles.card, styles.cardFeatured]}>
            <View style={styles.featuredTag}>
              <Text style={styles.featuredTagText}>가장 추천하는 멤버십 ✨</Text>
            </View>

            <View style={styles.planHeader}>
              <Text style={styles.planNameFeatured}>weganda+</Text>
              <Text style={styles.planDesc}>완벽한 임상 케어와 무제한 혜택</Text>
              <View style={styles.priceRow}>
                <Text style={styles.priceAmountFeatured}>
                  {billingCycle === 'monthly' ? '₩7,800' : '₩6,500'}
                </Text>
                <Text style={styles.pricePeriodFeatured}>/ 월 (VAT 포함)</Text>
              </View>
              {billingCycle === 'yearly' && (
                <Text style={styles.yearlyNote}>연간 ₩78,000원 정기결제</Text>
              )}
            </View>

            <TouchableOpacity
              style={styles.planBtnPrimary}
              onPress={() => onSelectPlan('plus')}
              activeOpacity={0.85}
            >
              <Text style={styles.planBtnPrimaryText}>weganda+ 7일 무료 체험</Text>
            </TouchableOpacity>

            <View style={styles.featureList}>
              <Text style={styles.featureListTitleFeatured}>Free의 모든 혜택 및 추가 특권</Text>
              {[
                '오행 사주 기반 듀티 운세 무제한 열람',
                'D/E/N 야간수당 및 월급 실수령액 정밀 예측기',
                'Ask AI 간호 지식 & 약물 계산기 무제한 질의',
                '동기 듀티 친구 무제한 연동 & 약속 일정 추천',
                '5종 프리미엄 테마 (딥 그린, 딥 블루, 퍼플 등)',
                'Pro 프리미엄 전용 엠블럼 및 광고 없는 청정 환경',
              ].map((feat, i) => (
                <View key={i} style={styles.featureItem}>
                  <Text style={styles.checkIconCoral}>✓</Text>
                  <Text style={styles.featureTextFeatured}>{feat}</Text>
                </View>
              ))}
            </View>
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    paddingVertical: 80,
    paddingHorizontal: 24,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
  },
  inner: {
    maxWidth: 960,
    width: '100%',
  },
  header: {
    alignItems: 'center',
    marginBottom: 48,
    textAlign: 'center' as any,
  },
  badge: {
    backgroundColor: '#FFF0F3',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 9999,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#FFE4E8',
  },
  badgeText: {
    fontSize: 13,
    fontWeight: '800',
    color: COLORS.primary,
  },
  title: {
    fontSize: Platform.OS === 'web' ? 36 : 26,
    fontWeight: '900',
    color: '#0F172A',
    marginBottom: 12,
    letterSpacing: -0.8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#64748B',
    textAlign: 'center',
    maxWidth: 600,
    marginBottom: 28,
  },
  cycleSwitcher: {
    flexDirection: 'row',
    backgroundColor: '#F1F5F9',
    borderRadius: 9999,
    padding: 4,
  },
  cycleBtn: {
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderRadius: 9999,
  },
  cycleBtnActive: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
  },
  cycleBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#64748B',
  },
  cycleBtnTextActive: {
    fontWeight: '800',
    color: '#0F172A',
  },
  grid: {
    flexDirection: Platform.OS === 'web' ? 'row' : 'column',
    gap: 28,
    alignItems: 'stretch',
    justifyContent: 'center',
  },
  card: {
    flex: 1,
    backgroundColor: '#FAFAFA',
    borderRadius: 24,
    padding: 32,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    position: 'relative',
  },
  cardFeatured: {
    backgroundColor: '#FFFFFF',
    borderColor: COLORS.primary,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.12,
    shadowRadius: 28,
  },
  featuredTag: {
    position: 'absolute',
    top: -14,
    right: 28,
    backgroundColor: COLORS.primary,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 9999,
  },
  featuredTagText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  planHeader: {
    marginBottom: 24,
  },
  planName: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 4,
  },
  planNameFeatured: {
    fontSize: 22,
    fontWeight: '900',
    color: COLORS.primary,
    marginBottom: 4,
  },
  planDesc: {
    fontSize: 13,
    color: '#64748B',
    marginBottom: 16,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 6,
  },
  priceAmount: {
    fontSize: 34,
    fontWeight: '900',
    color: '#0F172A',
  },
  pricePeriod: {
    fontSize: 14,
    color: '#64748B',
    fontWeight: '600',
  },
  priceAmountFeatured: {
    fontSize: 36,
    fontWeight: '900',
    color: '#0F172A',
  },
  pricePeriodFeatured: {
    fontSize: 14,
    color: '#64748B',
    fontWeight: '600',
  },
  yearlyNote: {
    fontSize: 12,
    color: COLORS.primary,
    fontWeight: '700',
    marginTop: 4,
  },
  planBtnSecondary: {
    backgroundColor: '#0F172A',
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
    marginBottom: 28,
  },
  planBtnSecondaryText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  planBtnPrimary: {
    backgroundColor: COLORS.primary,
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
    marginBottom: 28,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
  },
  planBtnPrimaryText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  featureList: {
    gap: 12,
  },
  featureListTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 4,
  },
  featureListTitleFeatured: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 4,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  checkIcon: {
    fontSize: 14,
    fontWeight: '900',
    color: '#10B981',
  },
  checkIconCoral: {
    fontSize: 14,
    fontWeight: '900',
    color: COLORS.primary,
  },
  featureText: {
    fontSize: 13,
    color: '#475569',
  },
  featureTextFeatured: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1E293B',
  },
});

