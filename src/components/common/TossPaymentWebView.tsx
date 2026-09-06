import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { COLORS } from '../../constants/theme';
import { ShieldCheckIcon } from './Icon';

interface TossPaymentWebViewProps {
  visible: boolean;
  onClose: () => void;
  onPaymentSuccess: () => void;
}

export const TossPaymentWebView: React.FC<TossPaymentWebViewProps> = ({
  visible,
  onClose,
  onPaymentSuccess,
}) => {
  const [step, setStep] = useState<'loading' | 'success'>('loading');

  useEffect(() => {
    let timeout: ReturnType<typeof setTimeout>;
    
    if (visible) {
      setStep('loading');
      timeout = setTimeout(() => {
        setStep('success');
        onPaymentSuccess();
      }, 2000);
    }

    return () => {
      if (timeout) {
        clearTimeout(timeout);
      }
    };
  }, [visible, onPaymentSuccess]);

  return (
    <Modal
      visible={visible}
      transparent={false}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        {step === 'loading' ? (
          <View style={styles.contentContainer}>
            <View style={styles.indicatorContainer}>
              <ActivityIndicator size="large" color="#0064FF" />
            </View>
            <Text style={styles.loadingText}>결제 처리 중...</Text>
            <Text style={styles.subText}>토스페이먼츠</Text>
            
            <TouchableOpacity 
              style={styles.cancelButton} 
              onPress={onClose}
              activeOpacity={0.6}
            >
              <Text style={styles.cancelButtonText}>취소</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.contentContainer}>
            <View style={styles.iconContainer}>
              <ShieldCheckIcon color="#10B981" size={56} />
            </View>
            <Text style={styles.successTitle}>🎉 구독 완료!</Text>
            <Text style={styles.successDescription}>
              weganda+ 구독이 성공적으로 완료되었습니다
            </Text>
            
            <TouchableOpacity 
              style={styles.confirmButton} 
              onPress={onClose}
              activeOpacity={0.8}
            >
              <Text style={styles.confirmButtonText}>확인</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background || '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  contentContainer: {
    alignItems: 'center',
    width: '100%',
  },
  // Loading Step Styles
  indicatorContainer: {
    marginBottom: 24,
  },
  loadingText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1A1A1A',
    marginBottom: 8,
  },
  subText: {
    fontSize: 13,
    color: '#9CA3AF',
    marginBottom: 40,
  },
  cancelButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    minHeight: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#6B7280',
    fontSize: 15,
    fontWeight: '500',
  },
  
  // Success Step Styles
  iconContainer: {
    marginBottom: 24,
  },
  successTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1A1A1A',
    marginBottom: 12,
  },
  successDescription: {
    fontSize: 15,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 40,
  },
  confirmButton: {
    backgroundColor: COLORS.primary || '#FF507C',
    borderRadius: 9999, // Pill shape
    width: '100%',
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 44,
  },
  confirmButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

