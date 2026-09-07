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
import { InAppPurchaseModal } from '../../components/common/InAppPurchaseModal';
import { inAppPurchaseService } from '../../services/inAppPurchaseService';
import { COLORS } from '../../constants/theme';
import { Alert } from 'react-native';

const BENEFITS = [
  { key: 'theme', title: '앱 커스텀 컬러 설정', description: '딥 그린, 딥 블루, 옐로, 퍼플 등\n나만의 앱 테마 컬러를 설정하세요', freeLimit: '기본 핑크만 사용 가능', iconColor: '#9B51E0', Icon: PaletteIcon },
  { key: 'fortune', title: '사주 서비스 무제한 제공', description: '매달 횟수 제한 없이\n간호 운세와 정밀 사주를 확인하세요', freeLimit: '월 5회 제한', iconColor: '#FF507C', Icon: FortuneIcon },
  { key: 'salary', title: '야간/휴일 수당 및 월급 예측기', description: 'D/E/N 근무 패턴 기반으로\n다음 달 예상 월급을 자동 계산해요', freeLimit: 'weganda+ 전용', iconColor: '#F59E0B', Icon: ChartBarIcon },
  { key: 'ai', title: '약물 계산기 & Ask AI 무제한', description: '복잡한 약물 용량 계산 프리셋과\nAI 임상 어시스턴트를 무제한 사용', freeLimit: '일일 3회 제한', iconColor: '#3B82F6', Icon: BotIcon },
  { key: 'calendar', title: '무제한 교집합 캘린더 & AI 모임 추천', description: '친구 수 제한 없이 듀티를 공유하고\nAI가 최적의 모임 날짜를 추천해드려요', freeLimit: '최대 3명 동기화', iconColor: '#10B981', Icon: CalendarIcon },
];

export interface MembershipScreenProps {
  visible: boolean;
  onClose: () => void;
}

export const MembershipScreen: React.FC<MembershipScreenProps> = ({ visible, onClose }) => {
  const [paymentVisible, setPaymentVisible] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);
  const isPremium = useUserStore((state) => state.isPremium);
  const subscribeToPremium = useUserStore((state) => state.subscribeToPremium);

  const handleSubscribe = () => {
    setPaymentVisible(true);
  };

  const handlePaymentSuccess = () => {
    setPaymentVisible(false);
    subscribeToPremium();
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
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
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

            {/* Benefits Section */}
            <View style={styles.benefitsSection}>
              <Text style={styles.sectionTitle}>프리미엄 혜택</Text>

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
                <TouchableOpacity style={styles.subscribeButton} onPress={handleSubscribe} activeOpacity={0.85}>
                  <Text style={styles.subscribeText}>우간다+ 구독하기 (월 7,800원)</Text>
                </TouchableOpacity>
                <View style={styles.captionRow}>
                  <Text style={styles.ctaCaption}>첫 7일 무료 • 스토어 계정으로 결제</Text>
                  <Text style={styles.captionDot}>•</Text>
                  <TouchableOpacity onPress={handleRestorePurchases} disabled={isRestoring}>
                    <Text style={styles.restoreText}>
                      {isRestoring ? '복원 중...' : '구매 복원'}
                    </Text>
                  </TouchableOpacity>
                </View>
              </>
            ) : (
              <TouchableOpacity style={styles.manageButton} activeOpacity={0.8}>
                <Text style={styles.manageText}>구독 관리</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {paymentVisible && (
          <InAppPurchaseModal
            visible={paymentVisible}
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
    justifyContent: 'center',
  },
  closeButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
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
    fontSize: 28,
    fontWeight: '800', // ExtraBold
    color: PREMIUM_THEME.gold,
    marginBottom: 12,
  },
  heroSubtitle: {
    fontSize: 16,
    color: PREMIUM_THEME.heroSubText,
    lineHeight: 24,
  },
  benefitsSection: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingTop: 28,
  },
  sectionTitle: {
    fontSize: 18,
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
    fontSize: 15,
    fontWeight: '700',
    color: '#065F46', // Dark emerald text
    marginBottom: 4,
  },
  premiumSuccessDesc: {
    fontSize: 13,
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
    fontSize: 15,
    fontWeight: '600', // SemiBold
    color: '#1A1A1A',
    marginBottom: 4,
  },
  cardDesc: {
    fontSize: 13,
    color: '#6B7280',
    lineHeight: 18,
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
    fontSize: 11,
    color: '#FF507C', // Primary brand color
    fontWeight: '500',
  },
  bottomSpacer: {
    height: 120,
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
    fontSize: 16,
    fontWeight: '700', // Bold
  },
  ctaCaption: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  captionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  captionDot: {
    fontSize: 12,
    color: '#D1D5DB',
  },
  restoreText: {
    fontSize: 12,
    color: '#4B5563',
    fontWeight: '600',
    textDecorationLine: 'underline',
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
});
