import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { COLORS } from '../../../constants/theme';
import { Button } from '../../common';
import { useMembershipEventStore } from '../../../store/useMembershipEventStore';
import { PREMIUM_BENEFITS } from '../../../constants/membership';
import { InAppPurchaseModal } from '../../common/InAppPurchaseModal';

interface Step3MembershipEventProps {
  onComplete: () => void;
}

export const Step3MembershipEvent: React.FC<Step3MembershipEventProps> = ({
  onComplete,
}) => {
  const [showIapModal, setShowIapModal] = useState(false);
  const getPlanPricing = useMembershipEventStore((state) => state.getPlanPricing);
  const monthlyPricing = getPlanPricing('monthly');

  const handleStartTrial = () => {
    setShowIapModal(true);
  };

  const handleIapSuccess = () => {
    setShowIapModal(false);
    onComplete();
  };

  return (
    <View style={styles.outerContainer}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* 헤딩 영역 */}
        <View style={styles.headingSection}>
          <View style={styles.stepBadge}>
            <Text style={styles.stepBadgeText}>3단계 · 출시 기념 특별 혜택</Text>
          </View>
          <Text style={styles.mainTitle}>첫 1개월은 우간다가 쏩니다! 🎁</Text>
          <Text style={styles.subtitle}>
            대한민국 50만 간호사를 위한 프리미엄 멤버십 weganda+
          </Text>
        </View>

        {/* Hero 출시 이벤트 카드 (Solid Deep Green & Gold) */}
        <View style={styles.heroCard}>
          <View style={styles.heroHeader}>
            <View style={styles.earlybirdBadge}>
              <Text style={styles.earlybirdBadgeText}>👑 출시 기념 얼리버드</Text>
            </View>
            <View style={styles.dDayBadge}>
              <Text style={styles.dDayBadgeText}>한정 혜택</Text>
            </View>
          </View>

          <Text style={styles.heroTitle}>첫 30일 100% 무료 체험</Text>
          <Text style={styles.heroDesc}>
            체험 후에도 평생{' '}
            <Text style={styles.highlightGold}>
              월 {monthlyPricing.currentPrice.toLocaleString()}원
            </Text>
            {' '}(정상가 {monthlyPricing.originalPrice.toLocaleString()}원)
          </Text>

          {/* 가격 비교 뱃지 바 */}
          <View style={styles.priceRow}>
            <View style={styles.priceTagOriginal}>
              <Text style={styles.originalPriceText}>
                정상가 월 {monthlyPricing.originalPrice.toLocaleString()}원
              </Text>
            </View>
            <Text style={styles.arrowText}>→</Text>
            <View style={styles.priceTagDiscount}>
              <Text style={styles.discountPriceText}>
                월 {monthlyPricing.currentPrice.toLocaleString()}원 (평생 {monthlyPricing.discountPercentage}% 할인)
              </Text>
            </View>
          </View>
        </View>

        {/* 5대 프리미엄 혜택 리스트 */}
        <View style={styles.benefitsSection}>
          <Text style={styles.benefitsSectionTitle}>weganda+ 5대 핵심 혜택</Text>
          <View style={styles.benefitsList}>
            {PREMIUM_BENEFITS.map((benefit, index) => (
              <View key={benefit.key} style={styles.benefitRow}>
                <View style={styles.benefitNumberCircle}>
                  <Text style={styles.benefitNumberText}>{index + 1}</Text>
                </View>
                <View style={styles.benefitContent}>
                  <Text style={styles.benefitTitle}>{benefit.title}</Text>
                  <Text style={styles.benefitDesc}>{benefit.description}</Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* 신뢰 & 안심 안내 박스 (토스 스타일) */}
        <View style={styles.trustBox}>
          <View style={styles.trustItem}>
            <Text style={styles.trustCheck}>✓</Text>
            <Text style={styles.trustText}>30일 동안 무료로 언제든 터치 한 번으로 해지 가능</Text>
          </View>
          <View style={styles.trustItem}>
            <Text style={styles.trustCheck}>✓</Text>
            <Text style={styles.trustText}>체험 종료 7일 전 알림으로 미리 안내</Text>
          </View>
          <View style={styles.trustItem}>
            <Text style={styles.trustCheck}>✓</Text>
            <Text style={styles.trustText}>약정 없는 100% 안전한 인앱 결제 (Apple / Google)</Text>
          </View>
        </View>

        {/* 하단 CTA 버튼 그룹 */}
        <View style={styles.footerSection}>
          <Button
            title="30일 무료 체험으로 시작하기"
            onPress={handleStartTrial}
            style={styles.trialButton}
          />

          <TouchableOpacity
            style={styles.freePassBtn}
            onPress={onComplete}
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityLabel="무료 기본 기능으로 시작하기"
          >
            <Text style={styles.freePassBtnText}>무료 기본 기능으로 시작할게요 ›</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* 인앱 결제 모달 연동 */}
      <InAppPurchaseModal
        visible={showIapModal}
        sku={monthlyPricing.sku}
        options={{
          planType: 'monthly',
          price: monthlyPricing.currentPrice,
          isTrial: true,
          isEarlybird: monthlyPricing.isDiscountActive,
        }}
        onClose={() => setShowIapModal(false)}
        onPaymentSuccess={handleIapSuccess}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  outerContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  container: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: 40,
  },
  headingSection: {
    marginBottom: 20,
  },
  stepBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#FFF0F3',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 10,
  },
  stepBadgeText: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.primary,
  },
  mainTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: '#191F28',
    letterSpacing: -0.6,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    lineHeight: 22,
    color: '#6B7280',
    fontWeight: '500',
  },
  heroCard: {
    backgroundColor: '#1B4332',
    borderRadius: 20,
    padding: 20,
    marginBottom: 24,
    shadowColor: '#1B4332',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 10,
    elevation: 4,
  },
  heroHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  earlybirdBadge: {
    backgroundColor: '#2D6A4F',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  earlybirdBadgeText: {
    color: '#D4A853',
    fontSize: 12,
    fontWeight: '700',
  },
  dDayBadge: {
    backgroundColor: '#D4A853',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  dDayBadgeText: {
    color: '#1B4332',
    fontSize: 11,
    fontWeight: '800',
  },
  heroTitle: {
    fontSize: 24,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: -0.5,
    marginBottom: 8,
  },
  heroDesc: {
    fontSize: 15,
    lineHeight: 22,
    color: '#E5E7EB',
    fontWeight: '500',
    marginBottom: 16,
  },
  highlightGold: {
    color: '#D4A853',
    fontWeight: '800',
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#133024',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
    gap: 8,
  },
  priceTagOriginal: {
    justifyContent: 'center',
  },
  originalPriceText: {
    fontSize: 12,
    color: '#9CA3AF',
    textDecorationLine: 'line-through',
  },
  arrowText: {
    color: '#D4A853',
    fontWeight: '700',
    fontSize: 12,
  },
  priceTagDiscount: {
    flex: 1,
  },
  discountPriceText: {
    fontSize: 13,
    color: '#D4A853',
    fontWeight: '800',
  },
  benefitsSection: {
    marginBottom: 24,
  },
  benefitsSectionTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#191F28',
    marginBottom: 14,
  },
  benefitsList: {
    gap: 12,
  },
  benefitRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#F8F9FA',
    borderRadius: 14,
    padding: 14,
    gap: 12,
  },
  benefitNumberCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#FFE8EE',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 2,
  },
  benefitNumberText: {
    color: COLORS.primary,
    fontSize: 12,
    fontWeight: '800',
  },
  benefitContent: {
    flex: 1,
  },
  benefitTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#333D4B',
    marginBottom: 3,
  },
  benefitDesc: {
    fontSize: 13,
    lineHeight: 18,
    color: '#6B7280',
    fontWeight: '500',
  },
  trustBox: {
    backgroundColor: '#F9FAFB',
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginBottom: 28,
    gap: 8,
  },
  trustItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  trustCheck: {
    color: '#10B981',
    fontWeight: '800',
    fontSize: 14,
  },
  trustText: {
    fontSize: 13,
    color: '#4E5968',
    fontWeight: '600',
    flex: 1,
  },
  footerSection: {
    gap: 12,
  },
  trialButton: {
    height: 54,
    borderRadius: 27,
    backgroundColor: COLORS.primary,
  },
  freePassBtn: {
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  freePassBtnText: {
    fontSize: 14,
    color: '#8B95A1',
    fontWeight: '600',
  },
});
