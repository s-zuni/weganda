import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
  Linking,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import {
  CrownIcon,
  PaletteIcon,
  FortuneIcon,
  ChartBarIcon,
  BotIcon,
  ShieldCheckIcon,
} from '../../components/common/Icon';

import { useUserStore } from '../../store/useUserStore';
import { useMembershipEventStore } from '../../store/useMembershipEventStore';
import { MembershipPlanKey } from '../../types/membershipEvent';
import { InAppPurchaseModal } from '../../components/common/InAppPurchaseModal';
import { inAppPurchaseService } from '../../services/inAppPurchaseService';
import { COLORS } from '../../constants/theme';

const BENEFITS = [
  {
    key: 'theme',
    title: '앱 커스텀 컬러 설정',
    description: '딥 그린, 딥 블루, 옐로, 퍼플 등\n나만의 앱 테마 컬러를 설정하세요',
    badge: 'PRO 전용',
    iconColor: '#FF507C',
    Icon: PaletteIcon,
  },
  {
    key: 'fortune',
    title: '사주 서비스 무제한 제공',
    description: '매달 횟수 제한 없이\n간호 운세와 정밀 사주를 확인하세요',
    badge: '무제한',
    iconColor: '#FF507C',
    Icon: FortuneIcon,
  },
  {
    key: 'salary',
    title: '야간/휴일 수당 및 월급 예측기',
    description: 'D/E/N 근무 패턴 기반으로\n다음 달 예상 월급을 자동 계산해요',
    badge: 'PRO 전용',
    iconColor: '#FF507C',
    Icon: ChartBarIcon,
  },
  {
    key: 'ai',
    title: '약물 계산기 & Ask AI 무제한',
    description: '복잡한 약물 용량 계산 프리셋과\nAI 임상 어시스턴트를 무제한 사용',
    badge: '무제한',
    iconColor: '#FF507C',
    Icon: BotIcon,
  },
  {
    key: 'burnout',
    title: '스마트 듀티 건강 & 번아웃 AI 분석',
    description: 'N-O-D 패턴, 수면 부채, 연속 근무 피로도를\nAI가 분석하여 회복 골든타임을 알려드려요',
    badge: 'PRO 전용',
    iconColor: '#FF507C',
    Icon: ShieldCheckIcon,
  },
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
  const { getPlanPricing } = useMembershipEventStore();

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
      <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
        {/* 상단 정갈한 Toss 스타일 헤더 */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={onClose}
            style={styles.closeIconButton}
            accessibilityRole="button"
            accessibilityLabel="닫기"
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          >
            <Ionicons name="close" size={24} color="#191F28" />
          </TouchableOpacity>

          <Text style={styles.headerTitle}>멤버십 안내</Text>

          <TouchableOpacity
            onPress={handleRestorePurchases}
            disabled={isRestoring}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            style={styles.headerRestoreButton}
          >
            <Text style={styles.headerRestoreText}>
              {isRestoring ? '복원 중' : '구매 복원'}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.container}>
          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            bounces={true}
          >
            {/* Hero Section — 순백 배경 + 블랙 헤드라인 + 핑크 포인트 */}
            <View style={styles.heroSection}>
              <View style={styles.brandBadge}>
                <CrownIcon size={14} color="#FF507C" />
                <Text style={styles.brandBadgeText}>weganda+ 멤버십</Text>
              </View>

              <Text style={styles.heroTitle}>
                간호사 라이프를{'\n'}
                <Text style={styles.heroTitleAccent}>가장 스마트하게</Text>
              </Text>

              <Text style={styles.heroSubtitle}>
                3교대 근무표부터 무제한 사주, 월급 예측, 임상 AI까지{'\n'}
                모든 제한 없이 자유롭게 경험해보세요
              </Text>
            </View>

            {/* 출시 이벤트 프로모션 배너 (Toss Minimalist Tint Card) */}
            {currentPricing.isFreeTrialActive && (
              <View style={styles.launchEventBanner}>
                <View style={styles.eventBadgeRow}>
                  <View style={styles.eventBannerBadge}>
                    <Text style={styles.eventBannerBadgeText}>🎉 런칭 기념 특가</Text>
                  </View>
                  <View style={styles.freeTrialTag}>
                    <Text style={styles.freeTrialTagText}>30일간 무료</Text>
                  </View>
                </View>
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
                      월간 구독
                    </Text>
                    {monthlyPricing.isDiscountActive && (
                      <View style={styles.discountPill}>
                        <Text style={styles.discountPillText}>-25% 평생</Text>
                      </View>
                    )}
                  </View>

                  <View style={styles.priceRow}>
                    <Text style={[styles.currentPriceText, selectedPlan === 'monthly' && styles.currentPriceTextSelected]}>
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
                      연간 구독
                    </Text>
                    {yearlyPricing.isDiscountActive && (
                      <View style={[styles.discountPill, styles.discountPillGreen]}>
                        <Text style={[styles.discountPillText, styles.discountPillTextGreen]}>평생 5.9만</Text>
                      </View>
                    )}
                  </View>

                  <View style={styles.priceRow}>
                    <Text style={[styles.currentPriceText, selectedPlan === 'yearly' && styles.currentPriceTextSelected]}>
                      ₩{yearlyPricing.currentPrice.toLocaleString()}
                    </Text>
                    <Text style={styles.pricePeriodText}>/ 년</Text>
                  </View>

                  {yearlyPricing.isDiscountActive && (
                    <Text style={styles.originalPriceCrossed}>
                      ₩{yearlyPricing.originalPrice.toLocaleString()}
                    </Text>
                  )}
                  <Text style={[styles.planBenefitNote, { color: '#059669' }]}>
                    월 4,916원 꼴 (가장 인기)
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* 💖 수익의 10% 기부 약속 (Social Impact Card) */}
            <View style={styles.donationCard}>
              <View style={styles.donationHeader}>
                <View style={styles.donationIconBox}>
                  <Ionicons name="heart" size={16} color="#FF507C" />
                </View>
                <View style={styles.donationBadge}>
                  <Text style={styles.donationBadgeText}>우간다의 선한 동행</Text>
                </View>
              </View>
              <Text style={styles.donationTitle}>
                수익의 10%는 간호가 필요한 어린이들과{'\n'}
                간호사를 꿈꾸는 이들을 위해 기부됩니다
              </Text>
              <Text style={styles.donationDesc}>
                우간다+ 멤버십을 이용해주시는 모든 분들의 따뜻한 마음을 모아, 구독료 수익의 10%를 돌봄이 절실한 소아 환아 의료 지원과 간호사를 꿈꾸는 예비 간호대생들을 위한 장학금으로 투명하게 기부합니다.
              </Text>
            </View>

            {/* Benefits Section */}
            <View style={styles.benefitsSection}>
              <Text style={styles.sectionTitle}>weganda+ 5대 핵심 혜택</Text>

              {isPremium && (
                <View style={styles.premiumSuccessCard}>
                  <View style={styles.premiumSuccessIcon}>
                    <ShieldCheckIcon size={22} color="#10B981" />
                  </View>
                  <View style={styles.premiumSuccessTexts}>
                    <Text style={styles.premiumSuccessTitle}>weganda+ 멤버십 이용 중 🎉</Text>
                    <Text style={styles.premiumSuccessDesc}>현재 모든 5대 프리미엄 혜택을 무제한으로 이용하고 계세요</Text>
                  </View>
                </View>
              )}

              <View style={styles.cardsContainer}>
                {BENEFITS.map((benefit) => {
                  const IconComponent = benefit.Icon;
                  return (
                    <View key={benefit.key} style={styles.benefitCard}>
                      <View style={styles.cardHeader}>
                        <View style={styles.iconCircle}>
                          <IconComponent size={20} color="#FF507C" />
                        </View>
                        <View style={styles.cardTexts}>
                          <View style={styles.benefitTitleRow}>
                            <Text style={styles.cardTitle}>{benefit.title}</Text>
                            <View style={styles.badgeContainer}>
                              <Text style={styles.badgeText}>{benefit.badge}</Text>
                            </View>
                          </View>
                          <Text style={styles.cardDesc}>{benefit.description}</Text>
                        </View>
                      </View>
                    </View>
                  );
                })}
              </View>
            </View>

            {/* 신뢰 & 안심 안내 */}
            <View style={styles.trustSection}>
              <View style={styles.trustItem}>
                <Ionicons name="checkmark-circle" size={18} color="#10B981" />
                <Text style={styles.trustText}>체험 기간 중 해지 시 비용 0원</Text>
              </View>
              <View style={styles.trustItem}>
                <Ionicons name="checkmark-circle" size={18} color="#10B981" />
                <Text style={styles.trustText}>공식 App Store / Google Play 안전 결제</Text>
              </View>
              <View style={styles.trustItem}>
                <Ionicons name="checkmark-circle" size={18} color="#10B981" />
                <Text style={styles.trustText}>언제든 마이페이지에서 간편 해지 가능</Text>
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
                  activeOpacity={0.88}
                  accessibilityRole="button"
                >
                  <Text style={styles.subscribeText}>
                    {currentPricing.isFreeTrialActive
                      ? '1개월 무료 체험 시작하기'
                      : `우간다+ 시작하기 (${selectedPlan === 'monthly' ? '월' : '연'} ${currentPricing.currentPrice.toLocaleString()}원)`}
                  </Text>
                </TouchableOpacity>

                <View style={styles.captionRow}>
                  <Text style={styles.ctaCaption}>
                    {currentPricing.isFreeTrialActive
                      ? `첫 30일 무료 체험 후 ${selectedPlan === 'monthly' ? `월 ${currentPricing.currentPrice.toLocaleString()}원` : `연 ${currentPricing.currentPrice.toLocaleString()}원`} 자동 결제`
                      : '스토어 계정으로 안전하게 결제'}
                  </Text>
                  <Text style={styles.ctaDonationNotice}>
                    💖 멤버십 수익의 10%는 환아 및 예비 간호인 장학금으로 기부됩니다
                  </Text>
                </View>

                <View style={styles.legalRow}>
                  <TouchableOpacity
                    onPress={() => {
                      const url = 'https://www.weganda.kr/membership';
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
                      const url = 'https://www.weganda.kr/privacy';
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
                  <Text style={styles.legalDot}>•</Text>
                  <TouchableOpacity
                    onPress={handleRestorePurchases}
                    disabled={isRestoring}
                  >
                    <Text style={styles.legalLinkText}>
                      {isRestoring ? '복원 중...' : '구매 복원'}
                    </Text>
                  </TouchableOpacity>
                </View>
              </>
            ) : (
              <TouchableOpacity
                style={styles.manageButton}
                onPress={onClose}
                activeOpacity={0.85}
                accessibilityRole="button"
                accessibilityLabel="구독 확인 완료"
              >
                <Text style={styles.manageText}>멤버십 이용 중 (확인 완료)</Text>
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
    backgroundColor: '#FFFFFF',
  },
  header: {
    height: 52,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F2F4F6',
  },
  closeIconButton: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#191F28',
  },
  headerRestoreButton: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  headerRestoreText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6B7280',
  },
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 20,
  },
  heroSection: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingTop: 28,
    paddingBottom: 24,
  },
  brandBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    alignSelf: 'flex-start',
    backgroundColor: '#FFF0F3',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    marginBottom: 16,
  },
  brandBadgeText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FF507C',
    letterSpacing: -0.2,
  },
  heroTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#191F28',
    lineHeight: 38,
    letterSpacing: -0.6,
    marginBottom: 10,
  },
  heroTitleAccent: {
    color: '#FF507C',
  },
  heroSubtitle: {
    fontSize: 15,
    color: '#4E5968',
    lineHeight: 22,
    letterSpacing: -0.3,
  },
  launchEventBanner: {
    marginHorizontal: 20,
    backgroundColor: '#FFF5F7',
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    borderColor: '#FFD1DC',
    marginBottom: 24,
  },
  eventBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  eventBannerBadge: {
    backgroundColor: '#FF507C',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  eventBannerBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  freeTrialTag: {
    backgroundColor: '#FFE8EE',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  freeTrialTagText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FF507C',
  },
  eventBannerTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#191F28',
    marginBottom: 6,
    letterSpacing: -0.3,
  },
  eventBannerDesc: {
    fontSize: 13,
    color: '#4E5968',
    lineHeight: 19,
    letterSpacing: -0.2,
  },
  planSelectorContainer: {
    paddingHorizontal: 20,
    marginBottom: 28,
  },
  planSelectorTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#191F28',
    marginBottom: 14,
    letterSpacing: -0.3,
  },
  planCardsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  planCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: '#E5E8EB',
    padding: 16,
    position: 'relative',
  },
  planCardSelected: {
    borderColor: '#FF507C',
    backgroundColor: '#FFF9FA',
    shadowColor: '#FF507C',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  popularTag: {
    position: 'absolute',
    top: -10,
    right: 12,
    backgroundColor: '#FF507C',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  popularTagText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: -0.2,
  },
  planCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  planCardName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#4E5968',
  },
  planCardNameSelected: {
    color: '#191F28',
  },
  discountPill: {
    backgroundColor: '#FFE8EE',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  discountPillGreen: {
    backgroundColor: '#E8F5E9',
  },
  discountPillText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FF507C',
  },
  discountPillTextGreen: {
    color: '#2E7D32',
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 2,
    marginBottom: 4,
  },
  currentPriceText: {
    fontSize: 22,
    fontWeight: '800',
    color: '#191F28',
    letterSpacing: -0.5,
  },
  currentPriceTextSelected: {
    color: '#FF507C',
  },
  pricePeriodText: {
    fontSize: 13,
    color: '#6B7280',
    fontWeight: '500',
  },
  originalPriceCrossed: {
    fontSize: 12,
    color: '#9CA3AF',
    textDecorationLine: 'line-through',
    marginBottom: 6,
  },
  planBenefitNote: {
    fontSize: 11,
    fontWeight: '600',
    color: '#FF507C',
    letterSpacing: -0.2,
  },
  donationCard: {
    marginHorizontal: 20,
    backgroundColor: '#FFF8F9',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#FFDCE4',
    padding: 18,
    marginBottom: 26,
  },
  donationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    gap: 8,
  },
  donationIconBox: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#FFE8EE',
    alignItems: 'center',
    justifyContent: 'center',
  },
  donationBadge: {
    backgroundColor: '#FF507C',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  donationBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: -0.2,
  },
  donationTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#191F28',
    lineHeight: 23,
    letterSpacing: -0.3,
    marginBottom: 8,
  },
  donationDesc: {
    fontSize: 13,
    color: '#4E5968',
    lineHeight: 20,
    letterSpacing: -0.2,
  },
  benefitsSection: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#191F28',
    marginBottom: 14,
    letterSpacing: -0.3,
  },
  premiumSuccessCard: {
    flexDirection: 'row',
    backgroundColor: '#F0FDF4',
    padding: 16,
    borderRadius: 16,
    marginBottom: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#86EFAC',
  },
  premiumSuccessIcon: {
    marginRight: 12,
  },
  premiumSuccessTexts: {
    flex: 1,
  },
  premiumSuccessTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#166534',
    marginBottom: 2,
  },
  premiumSuccessDesc: {
    fontSize: 13,
    color: '#15803D',
  },
  cardsContainer: {
    flexDirection: 'column',
    gap: 10,
  },
  benefitCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#F2F4F6',
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 1,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFF0F3',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  cardTexts: {
    flex: 1,
  },
  benefitTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#191F28',
    letterSpacing: -0.2,
  },
  badgeContainer: {
    backgroundColor: '#FFF0F3',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FF507C',
  },
  cardDesc: {
    fontSize: 13,
    color: '#4E5968',
    lineHeight: 18,
    letterSpacing: -0.2,
  },
  trustSection: {
    paddingHorizontal: 20,
    paddingVertical: 14,
    backgroundColor: '#F8F9FA',
    marginHorizontal: 20,
    borderRadius: 14,
    gap: 8,
  },
  trustItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  trustText: {
    fontSize: 13,
    color: '#4E5968',
    fontWeight: '500',
  },
  bottomSpacer: {
    height: 10,
  },
  stickyCTA: {
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#F2F4F6',
    paddingHorizontal: 20,
    paddingTop: 14,
    paddingBottom: Platform.OS === 'ios' ? 24 : 16,
  },
  subscribeButton: {
    height: 52,
    backgroundColor: '#FF507C',
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
    shadowColor: '#FF507C',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 3,
  },
  subscribeText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: -0.3,
  },
  captionRow: {
    alignItems: 'center',
    marginBottom: 8,
  },
  ctaCaption: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '500',
    letterSpacing: -0.2,
  },
  ctaDonationNotice: {
    fontSize: 11,
    color: '#FF507C',
    fontWeight: '600',
    textAlign: 'center',
    marginTop: 4,
    letterSpacing: -0.2,
  },
  legalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  legalLinkText: {
    fontSize: 11,
    color: '#8B95A1',
    fontWeight: '500',
  },
  legalDot: {
    fontSize: 11,
    color: '#D1D5DB',
  },
  manageButton: {
    height: 50,
    backgroundColor: '#F3F4F6',
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
  },
  manageText: {
    color: '#4E5968',
    fontSize: 15,
    fontWeight: '600',
  },
});
