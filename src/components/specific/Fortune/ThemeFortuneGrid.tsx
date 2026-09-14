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

      {/* 🌟 신규: 간호 직무와 무관한 순수 [내 사주 풀이] 특별 배너 카드 */}
      <TouchableOpacity
        style={styles.lifeHeroCard}
        onPress={() => handleCardPress('life')}
        activeOpacity={0.85}
      >
        <View style={styles.lifeHeroTopRow}>
          <View style={styles.lifeHeroBadge}>
            <MaterialCommunityIcons name="star-four-points" size={13} color="#4F46E5" />
            <Text style={styles.lifeHeroBadgeText}>간호 직무 무관 · 정통 평생 사주</Text>
          </View>
          <Text style={styles.lifeHeroLinkText}>원국 8글자 완비 ›</Text>
        </View>

        <Text style={styles.lifeHeroTitle}>정통 내 사주 풀이 (원국 & 평생 총운)</Text>
        <Text style={styles.lifeHeroDesc}>
          직업과 무관하게 한 사람으로서 타고난 사주 원국표, 오행, 신살, 10년 대운을 총체적으로 정밀 감정합니다.
        </Text>

        <View style={styles.lifeHeroPillsRow}>
          <View style={styles.lifePill}>
            <Text style={styles.lifePillText}>사주 원국표</Text>
          </View>
          <View style={styles.lifePill}>
            <Text style={styles.lifePillText}>오행 밸런스</Text>
          </View>
          <View style={styles.lifePill}>
            <Text style={styles.lifePillText}>특수 신살</Text>
          </View>
          <View style={styles.lifePill}>
            <Text style={styles.lifePillText}>10년 대운</Text>
          </View>
        </View>
      </TouchableOpacity>

      <View style={styles.clinicalHeader}>
        <Text style={styles.clinicalSubTitle}>간호 임상 특화 5대 테마 사주</Text>
        <Text style={styles.clinicalSubDesc}>오행 밸런스 기반 병동·듀티·대인관계 맞춤 분석</Text>
      </View>

      <View>
        <View style={styles.subFortuneGrid}>
          {SAJU_CATEGORIES.filter((cat) => cat.id !== 'life').map((cat) => (
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
                <View style={[styles.iconCircle, { backgroundColor: cat.bgLightColor }]}>
                  <MaterialCommunityIcons
                    name={cat.icon as any}
                    size={20}
                    color={cat.themeColor}
                  />
                </View>
                <View style={[styles.subBadge, { backgroundColor: cat.bgLightColor }]}>
                  <Text style={[styles.subBadgeText, { color: cat.themeColor }]}>
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
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  subBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  subBadgeText: {
    fontSize: 12,
    fontWeight: '700',
  },
  subCardTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 4,
  },
  subCardDesc: {
    fontSize: 13,
    color: COLORS.textMuted,
    lineHeight: 18,
  },
  lifeHeroCard: {
    backgroundColor: '#EEF2FF',
    borderRadius: 18,
    padding: 16,
    borderWidth: 1.5,
    borderColor: '#C7D2FE',
    marginBottom: 18,
    shadowColor: '#4F46E5',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  lifeHeroTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  lifeHeroBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 20,
    gap: 4,
    borderWidth: 1,
    borderColor: '#E0E7FF',
  },
  lifeHeroBadgeText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#4F46E5',
  },
  lifeHeroLinkText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#4F46E5',
  },
  lifeHeroTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1E1B4B',
    marginBottom: 4,
  },
  lifeHeroDesc: {
    fontSize: 13,
    color: '#475569',
    lineHeight: 18,
    marginBottom: 12,
  },
  lifeHeroPillsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  lifePill: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  lifePillText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#334155',
  },
  clinicalHeader: {
    marginBottom: 10,
  },
  clinicalSubTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.textPrimary,
    marginBottom: 2,
  },
  clinicalSubDesc: {
    fontSize: 12,
    color: COLORS.textMuted,
  },
});
