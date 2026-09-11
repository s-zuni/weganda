import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { COLORS } from '../../../constants/theme';

interface OnboardingProgressBarProps {
  currentStep: number;
  totalSteps: number;
  stepTitle?: string;
  onBack?: () => void;
  canGoBack?: boolean;
}

export const OnboardingProgressBar: React.FC<OnboardingProgressBarProps> = ({
  currentStep,
  totalSteps,
  stepTitle,
  onBack,
  canGoBack = true,
}) => {
  const progressPercent = Math.min(Math.max((currentStep / totalSteps) * 100, 0), 100);

  return (
    <View style={styles.container}>
      {/* 헤더 네비게이션 Row */}
      <View style={styles.headerRow}>
        {canGoBack && onBack ? (
          <TouchableOpacity
            style={styles.backButton}
            onPress={onBack}
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityLabel="이전 단계로"
          >
            <Text style={styles.backArrow}>‹</Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.placeholder} />
        )}

        <View style={styles.stepBadge}>
          <Text style={styles.stepBadgeText}>
            <Text style={styles.stepCurrent}>{currentStep}</Text>
            <Text style={styles.stepTotal}> / {totalSteps}</Text>
          </Text>
        </View>
      </View>

      {/* 프로그레스 바 라인 */}
      <View style={styles.track}>
        <View style={[styles.fill, { width: `${progressPercent}%` }]} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 16,
    backgroundColor: '#FFFFFF',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
    height: 44,
  },
  backButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  backArrow: {
    fontSize: 32,
    lineHeight: 32,
    color: COLORS.textPrimary,
    fontWeight: '300',
  },
  placeholder: {
    width: 44,
  },
  stepBadge: {
    backgroundColor: '#FFF0F3',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 16,
  },
  stepBadgeText: {
    fontSize: 13,
    fontWeight: '700',
  },
  stepCurrent: {
    color: COLORS.primary,
  },
  stepTotal: {
    color: COLORS.textMuted,
  },
  track: {
    height: 4,
    backgroundColor: '#F3F4F6',
    borderRadius: 2,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    backgroundColor: COLORS.primary,
    borderRadius: 2,
  },
});
