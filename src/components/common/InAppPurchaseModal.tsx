import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { COLORS } from '../../constants/theme';
import { ShieldCheckIcon, LockIcon } from './Icon';
import { inAppPurchaseService } from '../../services/inAppPurchaseService';

export interface InAppPurchaseModalProps {
  visible: boolean;
  onClose: () => void;
  onPaymentSuccess: () => void;
  sku?: string;
}

export const InAppPurchaseModal: React.FC<InAppPurchaseModalProps> = ({
  visible,
  onClose,
  onPaymentSuccess,
  sku,
}) => {
  const [step, setStep] = useState<'idle' | 'processing' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState<string>('');

  useEffect(() => {
    if (visible) {
      setStep('processing');
      setErrorMessage('');

      inAppPurchaseService
        .requestSubscription(sku)
        .then((result) => {
          if (result.success) {
            setStep('success');
            onPaymentSuccess();
          } else {
            setStep('error');
            setErrorMessage(result.errorMessage || '인앱 결제를 완료할 수 없습니다.');
          }
        })
        .catch((err) => {
          setStep('error');
          setErrorMessage(err?.message || '스토어 결제 처리 중 문제가 발생했습니다.');
        });
    } else {
      setStep('idle');
    }
  }, [visible, sku, onPaymentSuccess]);

  const storeName = Platform.select({
    ios: 'App Store (Apple StoreKit)',
    android: 'Google Play 스토어',
    default: '앱스토어 인앱 결제',
  });

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.dialogCard}>
          {step === 'processing' && (
            <View style={styles.contentContainer}>
              <View style={styles.indicatorContainer}>
                <ActivityIndicator size="large" color={COLORS.primary || '#FF507C'} />
              </View>
              <Text style={styles.titleText}>스토어 결제 진행 중</Text>
              <Text style={styles.subText}>{storeName}</Text>
              <Text style={styles.captionText}>
                구독 승인 및 영수증 유효성을 검증하고 있습니다. 잠시만 기다려주세요.
              </Text>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={onClose}
                activeOpacity={0.6}
              >
                <Text style={styles.cancelButtonText}>취소</Text>
              </TouchableOpacity>
            </View>
          )}

          {step === 'success' && (
            <View style={styles.contentContainer}>
              <View style={styles.iconContainer}>
                <ShieldCheckIcon color="#10B981" size={56} />
              </View>
              <Text style={styles.successTitle}>🎉 구독이 완료되었습니다!</Text>
              <Text style={styles.successDescription}>
                weganda+ 프리미엄 멤버십의 5대 핵심 혜택을 지금 바로 경험해보세요.
              </Text>
              <TouchableOpacity
                style={styles.confirmButton}
                onPress={onClose}
                activeOpacity={0.8}
              >
                <Text style={styles.confirmButtonText}>시작하기</Text>
              </TouchableOpacity>
            </View>
          )}

          {step === 'error' && (
            <View style={styles.contentContainer}>
              <View style={styles.errorIconContainer}>
                <LockIcon color="#EF4444" size={40} />
              </View>
              <Text style={styles.errorTitle}>결제 미완료</Text>
              <Text style={styles.errorDescription}>
                {errorMessage || '결제가 취소되었거나 처리되지 않았습니다.'}
              </Text>
              <View style={styles.buttonRow}>
                <TouchableOpacity
                  style={styles.retryButton}
                  onPress={() => {
                    setStep('processing');
                    inAppPurchaseService
                      .requestSubscription(sku)
                      .then((res) => {
                        if (res.success) {
                          setStep('success');
                          onPaymentSuccess();
                        } else {
                          setStep('error');
                          setErrorMessage(res.errorMessage || '결제를 완료할 수 없습니다.');
                        }
                      });
                  }}
                  activeOpacity={0.8}
                >
                  <Text style={styles.retryButtonText}>다시 시도</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.closeButton}
                  onPress={onClose}
                  activeOpacity={0.6}
                >
                  <Text style={styles.closeButtonText}>닫기</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 28,
  },
  dialogCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    width: '100%',
    paddingVertical: 28,
    paddingHorizontal: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 8,
  },
  contentContainer: {
    alignItems: 'center',
    width: '100%',
  },
  indicatorContainer: {
    marginBottom: 16,
  },
  titleText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 6,
    textAlign: 'center',
  },
  subText: {
    fontSize: 13,
    color: '#FF507C',
    fontWeight: '600',
    marginBottom: 10,
  },
  captionText: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 24,
    paddingHorizontal: 12,
  },
  cancelButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    minHeight: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#9CA3AF',
    fontSize: 14,
    fontWeight: '500',
  },
  iconContainer: {
    marginBottom: 16,
  },
  successTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 8,
    textAlign: 'center',
  },
  successDescription: {
    fontSize: 13,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
    paddingHorizontal: 8,
  },
  confirmButton: {
    backgroundColor: COLORS.primary || '#FF507C',
    borderRadius: 9999,
    width: '100%',
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
  },
  confirmButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  errorIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#FEE2E2',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 8,
  },
  errorDescription: {
    fontSize: 13,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 24,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 10,
    width: '100%',
  },
  retryButton: {
    flex: 1,
    backgroundColor: COLORS.primary || '#FF507C',
    borderRadius: 9999,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 44,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  closeButton: {
    flex: 1,
    backgroundColor: '#F3F4F6',
    borderRadius: 9999,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 44,
  },
  closeButtonText: {
    color: '#6B7280',
    fontSize: 14,
    fontWeight: '600',
  },
});
