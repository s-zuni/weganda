import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Platform,
  Linking,
  Alert,
} from 'react-native';

// Fallback to inline definitions if imports fail
const PREMIUM_THEME = {
  heroBg: '#1B4332',
  gold: '#D4A853',
  goldLight: '#F5E6C8',
  goldDark: '#B8922E',
  heroText: '#FFFFFF',
  heroSubText: 'rgba(255, 255, 255, 0.8)',
};

// Assuming the icons can be imported
import {
  CrownIcon,
  PaletteIcon,
  FortuneIcon,
  ChartBarIcon,
  BotIcon,
  CalendarIcon,
  LockIcon,
  ShieldCheckIcon,
} from '../../components/common/Icon';

import { useUserStore } from '../../store/useUserStore';
import { useMembershipEventStore } from '../../store/useMembershipEventStore';
import { MembershipPlanKey } from '../../types/membershipEvent';
import { InAppPurchaseModal } from '../../components/common/InAppPurchaseModal';
import { inAppPurchaseService } from '../../services/inAppPurchaseService';
import { COLORS } from '../../constants/theme';

const BENEFITS = [
  { key: 'theme', title: '앱 커스텀 컬러 설정', description: '딥 그린, 딥 블루, 옐로, 퍼플 등\n나만의 앱 테마 컬러를 설정하세요', freeLimit: '기본 핑크만 사용 가능', iconColor: '#9B51E0', Icon: PaletteIcon },
  { key: 'fortune', title: '사주 서비스 무제한 제공', description: '매달 횟수 제한 없이\n간호 운세와 정밀 사주를 확인하세요', freeLimit: '월 5회 제한', iconColor: '#FF507C', Icon: FortuneIcon },
  { key: 'salary', title: '야간/휴일 수당 및 월급 예측기', description: 'D/E/N 근무 패턴 기반으로\n다음 달 예상 월급을 자동 계산해요', freeLimit: 'weganda+ 전용', iconColor: '#F59E0B', Icon: ChartBarIcon },
  { key: 'ai', title: '약물 계산기 & Ask AI 무제한', description: '복잡한 약물 용량 계산 프리셋과\nAI 임상 어시스턴트를 무제한 사용', freeLimit: '일일 3회 제한', iconColor: '#3B82F6', Icon: BotIcon },
  { key: 'burnout', title: '스마트 듀티 건강 & 번아웃 위험도 AI 분석', description: 'N-O-D 패턴, 수면 부채, 연속 근무 피로도를\nAI가 분석하여 회복 골든타임을 알려드려요', freeLimit: 'weganda+ 전용', iconColor: '#10B981', Icon: ShieldCheckIcon },
];

export interface MembershipScreenProps {
  visible: boolean;
  onClose: () => void;
}

export const MembershipScreen: React.FC<MembershipScreenProps> = ({ visible, onClose }) => {
  const [selectedPlan, setSelectedPlan] = useState<MembershipPlanKey>('monthly');
  const [paymentVisible, setPaymentVisible] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);

  const isPremium = useUserStore((state) => state.isPremium);
  const subscribeToPremiumWithDetails = useUserStore((state) => state.subscribeToPremiumWithDetails);
  const { getPlanPricing, isFreeTrialActive } = useMembershipEventStore();

  const currentPricing = getPlanPricing(selectedPlan);
  const monthlyPricing = getPlanPricing('monthly');
  const yearlyPricing = getPlanPricing('yearly');

  const handleSubscribe = () => {
    setPaymentVisible(true);
  };

  const handlePaymentSuccess = () => {
    setPaymentVisible(false);
    onClose();
  };

  // 구매 복원 (Apple / Google 스토어 필수 정책)
  const handleRestorePurchases = async () => {
    setIsRestoring(true);
    try {
      const res = await inAppPurchaseService.restorePurchases();
      if (res.success) {
        Alert.alert('구매 복원 완료', '이전 구독 내역이 성공적으로 복원되었습니다.');
        onClose();
      } else {
        Alert.alert('복원 안내', res.errorMessage || '복원 가능한 이전 결제 내역이 없습니다.');
      }
    } catch (e: any) {
      Alert.alert('오류', '구매 내역을 복원하는 도중 오류가 발생했습니다.');
    } finally {
      setIsRestoring(false);
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={false}
      onRequestClose={onClose}
    >
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.container}>
          {/* Header - Absolute position */}
          <TouchableOpacity
            onPress={onClose}
            style={styles.closeButton}
            accessibilityRole="button"
            accessibilityLabel="닫기"
          >
            <Text style={styles.closeButtonText}>← 닫기</Text>
          </TouchableOpacity>

          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            bounces={false}
          >
            {/* Hero Section */}
            <View style={styles.heroSection}>
              <View style={styles.crownContainer}>
                <CrownIcon size={48} color={PREMIUM_THEME.gold} />
              </View>
              <Text style={styles.heroTitle}>weganda+</Text>
              <Text style={styles.heroSubtitle}>당신의 간호 라이프를</Text>
              <Text style={styles.heroSubtitle}>한 단계 높여보세요</Text>
            </View>

            {/* 출시 이벤트 프로모션 배너 */}
            {currentPricing.isFreeTrialActive && (
              <View style={styles.launchEventBanner}>
                <Text style={styles.eventBannerBadge}>🎉 런칭 기념 특가</Text>
                <Text style={styles.eventBannerTitle}>첫 1개월 0원 무료 체험 혜택</Text>
                <Text style={styles.eventBannerDesc}>
                  스토어 결제 수단 등록 후 1개월간 무료로 이용하세요.{'\n'}
                  무료 기간 종료 전 언제든 마이페이지에서 위약금 없이 해지 가능합니다.
                </Text>
              </View>
            )}

            {/* 플랜 선택기 (월간 vs 연간) */}
            <View style={styles.planSelectorContainer}>
              <Text style={styles.planSelectorTitle}>멤버십 플랜 선택</Text>
              <View style={styles.planCardsRow}>
                {/* 월간 플랜 */}
                <TouchableOpacity
                  style={[
                    styles.planCard,
                    selectedPlan === 'monthly' && styles.planCardSelected,
                  ]}
                  onPress={() => setSelectedPlan('monthly')}
                  activeOpacity={0.85}
                >
                  <View style={styles.planCardHeader}>
                    <Text style={[styles.planCardName, selectedPlan === 'monthly' && styles.planCardNameSelected]}>
                      월간 정기구독
                    </Text>
                    {monthlyPricing.isDiscountActive && (
                      <View style={styles.discountPill}>
                        <Text style={styles.discountPillText}>-25% 평생할인</Text>
                      </View>
                    )}
                  </View>

                  <View style={styles.priceRow}>
                    <Text style={styles.currentPriceText}>
                      ₩{monthlyPricing.currentPrice.toLocaleString()}
                    </Text>
                    <Text style={styles.pricePeriodText}>/ 월</Text>
                  </View>

                  {monthlyPricing.isDiscountActive && (
                    <Text style={styles.originalPriceCrossed}>
                      ₩{monthlyPricing.originalPrice.toLocaleString()}
                    </Text>
                  )}
                  <Text style={styles.planBenefitNote}>출시 얼리버드 평생 보장</Text>
                </TouchableOpacity>

                {/* 연간 플랜 */}
                <TouchableOpacity
                  style={[
                    styles.planCard,
                    selectedPlan === 'yearly' && styles.planCardSelected,
                  ]}
                  onPress={() => setSelectedPlan('yearly')}
                  activeOpacity={0.85}
                >
                  <View style={styles.popularTag}>
                    <Text style={styles.popularTagText}>BEST • 최대 절약</Text>
                  </View>

                  <View style={styles.planCardHeader}>
                    <Text style={[styles.planCardName, selectedPlan === 'yearly' && styles.planCardNameSelected]}>
                      연간 정기구독
                    </Text>
                    {yearlyPricing.isDiscountActive && (
                      <View style={[styles.discountPill, { backgroundColor: '#DEF7EC' }]}>
                        <Text style={[styles.discountPillText, { color: '#03543F' }]}>평생 5.9만</Text>
                      </View>
                    )}
                  </View>

                  <View style={styles.priceRow}>
                    <Text style={styles.currentPriceText}>
                      ₩{yearlyPricing.currentPrice.toLocaleString()}
                    </Text>
                    <Text style={styles.pricePeriodText}>/ 년</Text>
                  </View>

                  {yearlyPricing.isDiscountActive && (
                    <Text style={styles.originalPriceCrossed}>
                      ₩{yearlyPricing.originalPrice.toLocaleString()}
                    </Text>
                  )}
                  <Text style={styles.planBenefitNote}>월 4,916원 꼴 (추가 절약)</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Benefits Section */}
            <View style={styles.benefitsSection}>
              <Text style={styles.sectionTitle}>프리미엄 5대 혜택</Text>

              {isPremium && (
                <View style={styles.premiumSuccessCard}>
                  <View style={styles.premiumSuccessIcon}>
                    <ShieldCheckIcon size={24} color="#10B981" />
                  </View>
                  <View style={styles.premiumSuccessTexts}>
                    <Text style={styles.premiumSuccessTitle}>weganda+ 회원이시네요! 🎉</Text>
                    <Text style={styles.premiumSuccessDesc}>모든 프리미엄 기능을 이용하실 수 있습니다</Text>
                  </View>
                </View>
              )}

              <View style={styles.cardsContainer}>
                {BENEFITS.map((benefit) => {
                  const IconComponent = benefit.Icon;
                  return (
                    <View key={benefit.key} style={styles.benefitCard}>
                      <View style={styles.cardHeader}>
                        <View style={[styles.iconCircle, { backgroundColor: `${benefit.iconColor}1A` }]}>
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
            
            <View style={styles.bottomSpacer} />
          </ScrollView>

          {/* Sticky Bottom CTA */}
          <View style={styles.stickyCTA}>
            {!isPremium ? (
              <>
                <TouchableOpacity
                  style={styles.subscribeButton}
                  onPress={handleSubscribe}
                  activeOpacity={0.85}
                  accessibilityRole="button"
                >
                  <Text style={styles.subscribeText}>
                    {currentPricing.isFreeTrialActive
                      ? '1개월 무료 체험 시작하기'
                      : `우간다+ 구독하기 (${selectedPlan === 'monthly' ? '월' : '연'} ${currentPricing.currentPrice.toLocaleString()}원)`}
                  </Text>
                </TouchableOpacity>
                <View style={styles.captionRow}>
                  <Text style={styles.ctaCaption}>
                    {currentPricing.isFreeTrialActive
                      ? `1개월 무료 체험 후 ${selectedPlan === 'monthly' ? `월 ${currentPricing.currentPrice.toLocaleString()}원` : `연 ${currentPricing.currentPrice.toLocaleString()}원`} 자동 결제`
                      : '스토어 계정으로 안전하게 결제'}
                  </Text>
                  <Text style={styles.captionDot}>•</Text>
                  <TouchableOpacity
                    onPress={handleRestorePurchases}
                    disabled={isRestoring}
                    accessibilityRole="button"
                    accessibilityLabel="구매 복원"
                  >
                    <Text style={styles.restoreText}>
                      {isRestoring ? '복원 중...' : '구매 복원'}
                    </Text>
                  </TouchableOpacity>
                </View>
                <View style={styles.legalRow}>
                  <Text style={styles.cancelAnytimeNotice}>
                    * 무료 체험 종료 전 언제든 마이페이지에서 위약금 없이 해지 가능합니다.
                  </Text>
                </View>
                <View style={[styles.legalRow, { marginTop: 4 }]}>
                  <TouchableOpacity
                    onPress={() => {
                      const url = 'https://weganda.kr/membership';
                      if (Platform.OS === 'web' && typeof window !== 'undefined') {
                        window.open(url, '_blank');
                      } else {
                        Linking.openURL(url).catch((err) => console.warn(err));
                      }
                    }}
                    accessibilityRole="link"
                    accessibilityLabel="멤버십 이용약관"
                  >
                    <Text style={styles.legalLinkText}>멤버십 이용약관</Text>
                  </TouchableOpacity>
                  <Text style={styles.legalDot}>•</Text>
                  <TouchableOpacity
                    onPress={() => {
                      const url = 'https://weganda.kr/privacy';
                      if (Platform.OS === 'web' && typeof window !== 'undefined') {
                        window.open(url, '_blank');
                      } else {
                        Linking.openURL(url).catch((err) => console.warn(err));
                      }
                    }}
                    accessibilityRole="link"
                    accessibilityLabel="개인정보 처리방침"
                  >
                    <Text style={styles.legalLinkText}>개인정보 처리방침</Text>
                  </TouchableOpacity>
                </View>
              </>
            ) : (
              <TouchableOpacity
                style={styles.manageButton}
                onPress={onClose}
                activeOpacity={0.8}
                accessibilityRole="button"
                accessibilityLabel="구독 관리"
              >
                <Text style={styles.manageText}>마이페이지에서 구독 확인하기</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {paymentVisible && (
          <InAppPurchaseModal
            visible={paymentVisible}
            sku={currentPricing.sku}
            options={{
              planType: selectedPlan,
              price: currentPricing.currentPrice,
              isTrial: currentPricing.isFreeTrialActive,
              isEarlybird: currentPricing.isDiscountActive,
            }}
            onClose={() => setPaymentVisible(false)}
            onPaymentSuccess={handlePaymentSuccess}
          />
        )}
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: PREMIUM_THEME.heroBg,
  },
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  closeButton: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 10 : 20,
    left: 20,
    zIndex: 10,
    minWidth: 44,
    minHeight: 44,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 22,
    backgroundColor: 'rgba(0, 0, 0, 0.35)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  heroSection: {
    backgroundColor: PREMIUM_THEME.heroBg,
    paddingTop: 80, // Extra padding for absolute close button
    paddingBottom: 40,
    alignItems: 'center',
  },
  crownContainer: {
    marginBottom: 16,
  },
  heroTitle: {
    fontSize: 32,
    fontWeight: '800', // ExtraBold
    color: PREMIUM_THEME.gold,
    marginBottom: 12,
  },
  heroSubtitle: {
    fontSize: 18,
    color: PREMIUM_THEME.heroSubText,
    lineHeight: 26,
  },
  benefitsSection: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingTop: 28,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700', // Bold
    color: '#1A1A1A',
    marginBottom: 20,
  },
  premiumSuccessCard: {
    flexDirection: 'row',
    backgroundColor: '#ECFDF5', // Light emerald background
    padding: 16,
    borderRadius: 16,
    marginBottom: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#10B981',
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
    color: '#065F46', // Dark emerald text
    marginBottom: 4,
  },
  premiumSuccessDesc: {
    fontSize: 14,
    color: '#047857',
  },
  cardsContainer: {
    flexDirection: 'column',
    gap: 12,
  },
  benefitCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2, // For Android soft shadow
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22, // rounded-full
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
    fontWeight: '700', // Bold
    color: '#1A1A1A',
    marginBottom: 4,
  },
  cardDesc: {
    fontSize: 15,
    color: '#6B7280',
    lineHeight: 21,
  },
  badgeContainer: {
    alignSelf: 'flex-start',
    backgroundColor: '#FFF1F2', // coral pink bg tint
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    marginLeft: 56, // Align with text (44 icon + 12 margin)
  },
  badgeText: {
    fontSize: 13,
    color: '#FF507C', // Primary brand color
    fontWeight: '600',
  },
  bottomSpacer: {
    height: 140,
  },
  stickyCTA: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: Platform.OS === 'ios' ? 34 : 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 10,
    alignItems: 'center',
  },
  subscribeButton: {
    backgroundColor: '#1B4332',
    width: '100%',
    height: 56,
    borderRadius: 28, // rounded-full for 56 height
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    shadowColor: '#1B4332',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 4,
  },
  subscribeText: {
    color: PREMIUM_THEME.gold,
    fontSize: 17,
    fontWeight: '700', // Bold
  },
  ctaCaption: {
    fontSize: 13,
    color: '#9CA3AF',
  },
  captionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  captionDot: {
    fontSize: 13,
    color: '#D1D5DB',
  },
  restoreText: {
    fontSize: 13,
    color: '#4B5563',
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
  legalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 8,
  },
  legalLinkText: {
    fontSize: 12,
    color: '#9CA3AF',
    textDecorationLine: 'underline',
  },
  legalDot: {
    fontSize: 12,
    color: '#D1D5DB',
  },
  manageButton: {
    width: '100%',
    height: 56,
    borderRadius: 28,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  manageText: {
    color: '#6B7280',
    fontSize: 16,
    fontWeight: '600',
  },
  cancelAnytimeNotice: {
    fontSize: 11,
    color: '#9CA3AF',
    textAlign: 'center',
  },
  launchEventBanner: {
    backgroundColor: '#FFFBEB',
    borderWidth: 1.5,
    borderColor: '#FCD34D',
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 20,
    marginTop: -20,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  eventBannerBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#F59E0B',
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '800',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    marginBottom: 6,
  },
  eventBannerTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#92400E',
    marginBottom: 4,
  },
  eventBannerDesc: {
    fontSize: 12,
    color: '#78350F',
    lineHeight: 18,
  },
  planSelectorContainer: {
    paddingHorizontal: 20,
    marginTop: 16,
    marginBottom: 8,
  },
  planSelectorTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 12,
  },
  planCardsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  planCard: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    padding: 16,
    borderWidth: 2,
    borderColor: '#E2E8F0',
    position: 'relative',
  },
  planCardSelected: {
    backgroundColor: '#FFFFFF',
    borderColor: PREMIUM_THEME.heroBg,
    shadowColor: PREMIUM_THEME.heroBg,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  popularTag: {
    position: 'absolute',
    top: -10,
    right: 12,
    backgroundColor: '#D97706',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  popularTagText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '800',
  },
  planCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
    flexWrap: 'wrap',
    gap: 4,
  },
  planCardName: {
    fontSize: 13,
    fontWeight: '700',
    color: '#64748B',
  },
  planCardNameSelected: {
    color: PREMIUM_THEME.heroBg,
  },
  discountPill: {
    backgroundColor: '#FCE7F3',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  discountPillText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#BE185D',
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 2,
  },
  currentPriceText: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
  },
  pricePeriodText: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '600',
  },
  originalPriceCrossed: {
    fontSize: 11,
    color: '#94A3B8',
    textDecorationLine: 'line-through',
    marginTop: 2,
  },
  planBenefitNote: {
    fontSize: 11,
    color: '#059669',
    fontWeight: '600',
    marginTop: 8,
  },
});
