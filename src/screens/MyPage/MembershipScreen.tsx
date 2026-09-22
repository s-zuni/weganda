import React, { useState } from 'react';
import {
  Modal,
  View,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useUserStore } from '../../store/useUserStore';
import { useMembershipEventStore } from '../../store/useMembershipEventStore';
import { MembershipPlanKey } from '../../types/membershipEvent';
import { InAppPurchaseModal } from '../../components/common/InAppPurchaseModal';
import { inAppPurchaseService } from '../../services/inAppPurchaseService';
import {
  MembershipHeader,
  MembershipLaunchPromoBanner,
  MembershipPlanSelector,
  MembershipBenefitsList,
  MembershipStickyCTA,
} from '../../components/specific/MyPage';
import { COLORS } from '../../constants/theme';
import { PREMIUM_COLORS } from '../../constants/premiumTheme';

export interface MembershipScreenProps {
  visible: boolean;
  onClose: () => void;
}

export const MembershipScreen: React.FC<MembershipScreenProps> = ({ visible, onClose }) => {
  const [selectedPlan, setSelectedPlan] = useState<MembershipPlanKey>('monthly');
  const [paymentVisible, setPaymentVisible] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);

  const isPremium = useUserStore((state) => state.isPremium);
  const { getPlanPricing, config } = useMembershipEventStore();

  const currentPricing = getPlanPricing(selectedPlan);
  const monthlyPricing = getPlanPricing('monthly');
  const yearlyPricing = getPlanPricing('yearly');
  const trialDays = config.freeTrialEvent.trialDays || 30;

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
          {/* 헤더 및 히어로 섹션 */}
          <MembershipHeader onClose={onClose} />

          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            bounces={false}
          >
            {/* 출시 이벤트 프로모션 배너 */}
            <MembershipLaunchPromoBanner
              isFreeTrialActive={currentPricing.isFreeTrialActive}
              trialDays={trialDays}
            />

            {/* 플랜 선택기 (월간 vs 연간) */}
            <MembershipPlanSelector
              selectedPlan={selectedPlan}
              onSelectPlan={setSelectedPlan}
              monthlyPricing={monthlyPricing}
              yearlyPricing={yearlyPricing}
            />

            {/* 프리미엄 5대 혜택 목록 */}
            <MembershipBenefitsList isPremium={isPremium} />

            <View style={styles.bottomSpacer} />
          </ScrollView>

          {/* 하단 고정 액션 버튼 (구독 / 구매 복원 / 약관) */}
          <MembershipStickyCTA
            isPremium={isPremium}
            selectedPlan={selectedPlan}
            currentPricing={currentPricing}
            isRestoring={isRestoring}
            trialDays={trialDays}
            onSubscribe={handleSubscribe}
            onRestore={handleRestorePurchases}
            onClose={onClose}
          />
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
              trialDays,
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
    backgroundColor: PREMIUM_COLORS.heroBg,
  },
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  bottomSpacer: {
    height: 140,
  },
});
