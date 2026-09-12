import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  TouchableWithoutFeedback,
  Linking,
  Alert,
  ActivityIndicator,
  Platform,
} from 'react-native';
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
      // restorePurchases()가 서버 검증까지 마친 뒤 store를 직접 갱신하므로,
      // 여기서는 결과 메시지만 안내한다(클라이언트가 임의로 프리미엄을 부여하지 않는다).
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
              <View style={styles.iconContainer}>
                <CrownIcon color="#D4A853" size={32} />
              </View>

              <Text style={styles.title}>weganda+ 전용 기능</Text>

              {(featureTitle || featureDescription) && (
                <View style={styles.featureInfoContainer}>
                  {featureTitle && (
                    <Text style={styles.featureTitle}>{featureTitle}</Text>
                  )}
                  {featureDescription && (
                    <Text style={styles.featureDescription}>
                      {featureDescription}
                    </Text>
                  )}
                </View>
              )}

              <View style={styles.benefitsContainer}>
                <Text style={styles.benefitText}>✓ 사주 서비스 무제한</Text>
                <Text style={styles.benefitText}>✓ 월급/수당 자동 예측기</Text>
                <Text style={styles.benefitText}>✓ AI 모임 날짜 추천</Text>
              </View>

              <TouchableOpacity
                style={styles.primaryButton}
                onPress={onSubscribe}
                activeOpacity={0.8}
                accessibilityRole="button"
                accessibilityLabel="우간다+ 구독하기 (월 5,900원~)"
              >
                <Text style={styles.primaryButtonText}>
                  우간다+ 구독하기 (월 5,900원~)
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.secondaryButton}
                onPress={onLearnMore}
                activeOpacity={0.6}
                accessibilityRole="button"
                accessibilityLabel="자세히 알아보기"
              >
                <Text style={styles.secondaryButtonText}>
                  자세히 알아보기 {'>'}
                </Text>
              </TouchableOpacity>

              {/* 🔄 구매 복원 버튼 (Apple Guideline 3.1.1 필수 요건) */}
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

              <View style={styles.legalRow}>
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
            </View>
          </View>
    </SwipeableBottomSheet>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'flex-end',
  },
  sheetContainer: {
    backgroundColor: COLORS.background || '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingBottom: 40,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 10,
  },
  handleContainer: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  handle: {
    width: 40,
    height: 4,
    backgroundColor: '#E5E7EB',
    borderRadius: 2,
  },
  contentContainer: {
    alignItems: 'center',
  },
  iconContainer: {
    marginTop: 8,
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1A1A1A',
    marginBottom: 16,
  },
  featureInfoContainer: {
    alignItems: 'center',
    marginBottom: 24,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    width: '100%',
  },
  featureTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#374151',
    marginBottom: 4,
  },
  featureDescription: {
    fontSize: 15,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 21,
  },
  benefitsContainer: {
    alignSelf: 'flex-start',
    marginLeft: 20,
    marginBottom: 32,
  },
  benefitText: {
    fontSize: 16,
    color: '#4B5563',
    marginBottom: 12,
    fontWeight: '600',
  },
  primaryButton: {
    backgroundColor: COLORS.primary || '#FF507C',
    borderRadius: 9999,
    width: '100%',
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    minHeight: 44,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: 'bold',
  },
  secondaryButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    minHeight: 44,
    justifyContent: 'center',
  },
  secondaryButtonText: {
    color: '#6B7280',
    fontSize: 15,
    fontWeight: '500',
  },
  restoreButton: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  restoreButtonText: {
    color: '#6B7280',
    fontSize: 13,
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
  legalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 12,
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
});

