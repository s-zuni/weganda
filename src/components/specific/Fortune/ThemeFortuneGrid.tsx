import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS } from '../../../constants/theme';
import { PremiumLockOverlay } from '../../common/PremiumLockOverlay';
import { FREE_LIMITS } from '../../../constants/membership';
import { SAJU_CATEGORIES, SajuCategoryId } from '../../../mocks/sajuCategories';

export interface ThemeFortuneGridProps {
  isPremium: boolean;
  monthlyFortuneCount: number;
  onOpenSaju?: () => void;
  onOpenLove?: () => void;
  onOpenCareer?: () => void;
  onOpenWealth?: () => void;
  onSelectCategory?: (categoryId: SajuCategoryId) => void;
  onOpenPaywall: () => void;
}

export const ThemeFortuneGrid: React.FC<ThemeFortuneGridProps> = ({
  isPremium,
  monthlyFortuneCount,
  onOpenSaju,
  onOpenLove,
  onOpenCareer,
  onOpenWealth,
  onSelectCategory,
  onOpenPaywall,
}) => {
  const isLocked = !isPremium && monthlyFortuneCount >= FREE_LIMITS.maxMonthlyFortune;

  const handleCardPress = (catId: SajuCategoryId) => {
    if (onSelectCategory) {
      onSelectCategory(catId);
      return;
    }
    if (catId === 'nurse') onOpenSaju?.();
    else if (catId === 'love') onOpenLove?.();
    else if (catId === 'career') onOpenCareer?.();
    else if (catId === 'wealth') onOpenWealth?.();
  };

  return (
    <View style={styles.container}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>5대 정밀 맞춤 사주 & 케미</Text>
        <Text style={styles.sectionHint}>터치하여 주제별 정밀 분석 확인</Text>
      </View>

      {/* weganda+ 운세 횟수 제한 배너 */}
      {!isPremium && (
        <View style={styles.fortuneLimitBanner}>
          <Text style={styles.fortuneLimitText}>
            이번 달 무료 운세 {monthlyFortuneCount}/{FREE_LIMITS.maxMonthlyFortune}회 사용
          </Text>
          {isLocked && (
            <TouchableOpacity onPress={onOpenPaywall}>
              <Text style={styles.fortuneUpgradeLink}>weganda+로 무제한 이용 ›</Text>
            </TouchableOpacity>
          )}
        </View>
      )}

      <View>
        <View style={styles.subFortuneGrid}>
          {SAJU_CATEGORIES.map((cat) => (
            <TouchableOpacity
              key={cat.id}
              style={[
                styles.subCard,
                cat.id === 'wealth' && styles.fullWidthCard,
              ]}
              onPress={() => handleCardPress(cat.id)}
              activeOpacity={0.8}
            >
              <View style={styles.subCardHeader}>
                <View style={styles.iconCircle}>
                  <MaterialCommunityIcons
                    name={cat.icon as any}
                    size={20}
                    color="#4E5968"
                  />
                </View>
                <View style={styles.subBadge}>
                  <Text style={styles.subBadgeText}>
                    {cat.highlightTag}
                  </Text>
                </View>
              </View>
              <Text style={styles.subCardTitle}>{cat.title}</Text>
              <Text style={styles.subCardDesc} numberOfLines={2}>
                {cat.subtitle}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {isLocked && (
          <PremiumLockOverlay
            message="이번 달 무료 운세를 모두 사용했어요"
            onUpgradePress={onOpenPaywall}
          />
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  sectionHint: {
    fontSize: 14,
    color: COLORS.textMuted,
  },
  fortuneLimitBanner: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFF8E7',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    marginBottom: 12,
  },
  fortuneLimitText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#B8922E',
  },
  fortuneUpgradeLink: {
    fontSize: 14,
    fontWeight: '700',
    color: '#B8922E',
  },
  subFortuneGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: 12,
  },
  subCard: {
    width: '48.5%',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
    minHeight: 115,
  },
  fullWidthCard: {
    width: '100%',
  },
  subCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  iconCircle: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: '#F8F9FA',
    alignItems: 'center',
    justifyContent: 'center',
  },
  subBadge: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  subBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#475569',
  },
  subCardTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#191F28',
    marginBottom: 4,
  },
  subCardDesc: {
    fontSize: 13,
    color: COLORS.textMuted,
    lineHeight: 18,
  },
});
