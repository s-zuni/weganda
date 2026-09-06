import React from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  TouchableWithoutFeedback,
} from 'react-native';
import { COLORS } from '../../constants/theme';
import { CrownIcon } from './Icon';

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
  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <TouchableOpacity
        style={styles.backdrop}
        activeOpacity={1}
        onPressOut={onClose}
      >
        <TouchableWithoutFeedback>
          <View style={styles.sheetContainer}>
            <View style={styles.handleContainer}>
              <View style={styles.handle} />
            </View>

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
              >
                <Text style={styles.primaryButtonText}>
                  우간다+ 구독하기 (월 7,800원)
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.secondaryButton}
                onPress={onLearnMore}
                activeOpacity={0.6}
              >
                <Text style={styles.secondaryButtonText}>
                  자세히 알아보기 {'>'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableWithoutFeedback>
      </TouchableOpacity>
    </Modal>
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
    fontSize: 18,
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
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 4,
  },
  featureDescription: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
  },
  benefitsContainer: {
    alignSelf: 'flex-start',
    marginLeft: 20,
    marginBottom: 32,
  },
  benefitText: {
    fontSize: 15,
    color: '#4B5563',
    marginBottom: 12,
    fontWeight: '500',
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
    fontSize: 16,
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
    fontSize: 14,
    fontWeight: '500',
  },
});

