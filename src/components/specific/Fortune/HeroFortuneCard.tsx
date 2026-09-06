import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { COLORS } from '../../../constants/theme';

interface HeroFortuneCardProps {
  formattedToday: string;
  overallScore: number;
  title?: string;
  description?: string;
  isLoading: boolean;
  onRefresh: () => void;
}

export const HeroFortuneCard: React.FC<HeroFortuneCardProps> = ({
  formattedToday,
  overallScore,
  title,
  description,
  isLoading,
  onRefresh,
}) => {
  return (
    <View style={styles.heroCard}>
      <View style={styles.heroTopRow}>
        <View style={styles.heroDateCol}>
          <Text style={styles.heroDate}>{formattedToday}</Text>
          <Text style={styles.heroHeading}>오늘의 행운 지수</Text>
        </View>
        <TouchableOpacity
          style={styles.scoreCircle}
          onPress={onRefresh}
          disabled={isLoading}
          activeOpacity={0.8}
        >
          {isLoading ? (
            <ActivityIndicator color={COLORS.primary} size="small" />
          ) : (
            <Text style={styles.scoreNumber}>{overallScore}</Text>
          )}
        </TouchableOpacity>
      </View>

      <View style={styles.heroQuoteContainer}>
        <Text style={styles.heroQuote}>
          {title ? `"${title}"` : '"오늘은 새로운 시작을 알리는 날이에요"'}
        </Text>
        <Text style={styles.heroDescription}>
          {description ||
            '동료와의 협력이 빛을 발하는 하루입니다. 오후 근무 중 예상치 못한 긍정적인 소식이 있을 수 있어요.'}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  heroCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 3,
  },
  heroTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  heroDateCol: {
    gap: 4,
  },
  heroDate: {
    fontSize: 12,
    color: COLORS.textMuted,
    fontWeight: '600',
  },
  heroHeading: {
    fontSize: 20,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  scoreCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#FFF1F4',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: COLORS.primary,
  },
  scoreNumber: {
    fontSize: 24,
    fontWeight: '900',
    color: COLORS.primary,
  },
  heroQuoteContainer: {
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    paddingTop: 14,
    gap: 6,
  },
  heroQuote: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.primary,
    lineHeight: 22,
  },
  heroDescription: {
    fontSize: 13,
    color: COLORS.textSecondary,
    lineHeight: 20,
  },
});

