import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Linking,
  Alert,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../constants/theme';
import { CrownIcon } from './Icon';
import { inAppPurchaseService } from '../../services/inAppPurchaseService';
import { SwipeableBottomSheet } from './SwipeableBottomSheet';

interface PaywallBottomSheetProps {
  visible: boolean;
  onClose: () => void;
  onSubscribe: () => void;
  onLearnMore: () => void;
  featureTitle?: string;
  featureDescription?: string;
}

export const PaywallBottomSheet: React.FC<PaywallBottomSheetProps> = ({
  visible,
  onClose,
  onSubscribe,
  onLearnMore,
  featureTitle,
  featureDescription,
}) => {
  const [isRestoring, setIsRestoring] = useState(false);

  const handleRestore = async () => {
    setIsRestoring(true);
    try {
      const result = await inAppPurchaseService.restorePurchases();
      if (result.success) {
        Alert.alert('구매 복원 완료', '이전 구독 내역이 성공적으로 복원되었습니다.');
        onClose();
      } else {
        Alert.alert('복원 내역 없음', result.errorMessage || '복원할 수 있는 활성 구독 내역을 찾을 수 없습니다.');
      }
    } catch (e: any) {
      Alert.alert('복원 실패', e.message || '구매 내역 복원 중 오류가 발생했습니다.');
    } finally {
      setIsRestoring(false);
    }
  };

  return (
    <SwipeableBottomSheet visible={visible} onClose={onClose}>
      <View style={styles.sheetContainer}>
        <View style={styles.contentContainer}>
          {/* 상단 핑크 틴트 아이콘 서클 */}
          <View style={styles.iconCircle}>
            <CrownIcon color="#FF507C" size={26} />
          </View>

          <View style={styles.brandBadge}>
            <Text style={styles.brandBadgeText}>weganda+ 멤버십 전용</Text>
          </View>

          <Text style={styles.title}>
            {featureTitle || '더 스마트한 간호 라이프를 시작하세요'}
          </Text>

          {featureDescription && (
            <Text style={styles.descriptionText}>
              {featureDescription}
            </Text>
          )}

          {/* 3대 핵심 혜택 리스트 (Toss 깔끔한 스타일) */}
          <View style={styles.benefitsCard}>
            <View style={styles.benefitRow}>
              <Ionicons name="checkmark-circle" size={20} color="#FF507C" />
              <Text style={styles.benefitText}>사주 서비스 무제한 제공</Text>
            </View>
            <View style={styles.benefitRow}>
              <Ionicons name="checkmark-circle" size={20} color="#FF507C" />
              <Text style={styles.benefitText}>야간/휴일 수당 & 월급 자동 예측기</Text>
            </View>
            <View style={styles.benefitRow}>
              <Ionicons name="checkmark-circle" size={20} color="#FF507C" />
              <Text style={styles.benefitText}>약물 계산기 & Ask AI 무제한 이용</Text>
            </View>
          </View>

          {/* 메인 구독 시작 버튼 */}
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={onSubscribe}
            activeOpacity={0.88}
            accessibilityRole="button"
            accessibilityLabel="1개월 무료 체험 시작하기"
          >
            <Text style={styles.primaryButtonText}>
              1개월 무료 체험 시작하기
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={onLearnMore}
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityLabel="멤버십 혜택 자세히 보기"
          >
            <Text style={styles.secondaryButtonText}>
              멤버십 혜택 자세히 보기 ›
            </Text>
          </TouchableOpacity>

          {/* 구매 복원 버튼 */}
          <TouchableOpacity
            style={styles.restoreButton}
            onPress={handleRestore}
            disabled={isRestoring}
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityLabel="구매 내역 복원"
          >
            {isRestoring ? (
              <ActivityIndicator size="small" color="#6B7280" />
            ) : (
              <Text style={styles.restoreButtonText}>
                이미 구독 중이신가요? 구매 내역 복원
              </Text>
            )}
          </TouchableOpacity>

          {/* 하단 약관 링크 */}
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
          </View>
        </View>
      </View>
    </SwipeableBottomSheet>
  );
};

const styles = StyleSheet.create({
  sheetContainer: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingBottom: Platform.OS === 'ios' ? 36 : 24,
    paddingTop: 8,
  },
  contentContainer: {
    alignItems: 'center',
  },
  iconCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#FFF0F3',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 6,
    marginBottom: 12,
  },
  brandBadge: {
    backgroundColor: '#FFF5F7',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    marginBottom: 10,
  },
  brandBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FF507C',
    letterSpacing: -0.2,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: '#191F28',
    textAlign: 'center',
    letterSpacing: -0.5,
    marginBottom: 8,
  },
  descriptionText: {
    fontSize: 14,
    color: '#4E5968',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 20,
    paddingHorizontal: 16,
  },
  benefitsCard: {
    width: '100%',
    backgroundColor: '#F8F9FA',
    borderRadius: 16,
    padding: 18,
    gap: 12,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#F2F4F6',
  },
  benefitRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  benefitText: {
    fontSize: 15,
    color: '#191F28',
    fontWeight: '600',
    letterSpacing: -0.2,
  },
  primaryButton: {
    backgroundColor: '#FF507C',
    borderRadius: 26,
    width: '100%',
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
    shadowColor: '#FF507C',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 3,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: -0.3,
  },
  secondaryButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginBottom: 10,
  },
  secondaryButtonText: {
    color: '#4E5968',
    fontSize: 14,
    fontWeight: '600',
    letterSpacing: -0.2,
  },
  restoreButton: {
    paddingVertical: 6,
    marginBottom: 16,
  },
  restoreButtonText: {
    fontSize: 12,
    color: '#8B95A1',
    fontWeight: '500',
  },
  legalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  legalLinkText: {
    fontSize: 11,
    color: '#9CA3AF',
    fontWeight: '500',
  },
  legalDot: {
    fontSize: 11,
    color: '#E5E8EB',
  },
});
