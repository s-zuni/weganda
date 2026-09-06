import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { COLORS } from '../../../constants/theme';
import {
  StethoscopeIcon,
  HeartIcon,
  BriefcaseIcon,
  CoinsIcon,
} from '../../common/Icon';
import { PremiumLockOverlay } from '../../common/PremiumLockOverlay';
import { FREE_LIMITS } from '../../../constants/membership';

interface ThemeFortuneGridProps {
  isPremium: boolean;
  monthlyFortuneCount: number;
  onOpenSaju: () => void;
  onOpenLove: () => void;
  onOpenCareer: () => void;
  onOpenWealth: () => void;
  onOpenPaywall: () => void;
}

export const ThemeFortuneGrid: React.FC<ThemeFortuneGridProps> = ({
  isPremium,
  monthlyFortuneCount,
  onOpenSaju,
  onOpenLove,
  onOpenCareer,
  onOpenWealth,
  onOpenPaywall,
}) => {
  const isLocked = !isPremium && monthlyFortuneCount >= FREE_LIMITS.maxMonthlyFortune;

  return (
    <View style={styles.container}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>4대 맞춤형 정밀 세부 운세</Text>
        <Text style={styles.sectionHint}>터치하여 그래프·표 분석 확인</Text>
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
          {/* 1. 간호 사주 */}
          <TouchableOpacity
            style={styles.subCard}
            onPress={onOpenSaju}
            activeOpacity={0.8}
          >
            <View style={styles.subCardHeader}>
              <View style={[styles.iconCircle, { backgroundColor: '#FFF1F4' }]}>
                <StethoscopeIcon size={20} color={COLORS.primary} />
              </View>
              <View style={[styles.subBadge, { backgroundColor: '#FFF1F4' }]}>
                <Text style={[styles.subBadgeText, { color: COLORS.primary }]}>
                  궁합 94점
                </Text>
              </View>
            </View>
            <Text style={styles.subCardTitle}>간호 사주</Text>
            <Text style={styles.subCardDesc}>
              내 직장 오행 궁합 · 간호 적합도 · 병동 랭킹
            </Text>
          </TouchableOpacity>

          {/* 2. 애정운 */}
          <TouchableOpacity
            style={styles.subCard}
            onPress={onOpenLove}
            activeOpacity={0.8}
          >
            <View style={styles.subCardHeader}>
              <View style={[styles.iconCircle, { backgroundColor: '#FEE2E2' }]}>
                <HeartIcon size={18} color="#E11D48" />
              </View>
              <View style={[styles.subBadge, { backgroundColor: '#FEE2E2' }]}>
                <Text style={[styles.subBadgeText, { color: '#E11D48' }]}>MBTI 케미</Text>
              </View>
            </View>
            <Text style={styles.subCardTitle}>애정운</Text>
            <Text style={styles.subCardDesc}>
              애인 사주 궁합 · MBTI 성격 솔루션 · 짝사랑
            </Text>
          </TouchableOpacity>

          {/* 3. 직업운 */}
          <TouchableOpacity
            style={styles.subCard}
            onPress={onOpenCareer}
            activeOpacity={0.8}
          >
            <View style={styles.subCardHeader}>
              <View style={[styles.iconCircle, { backgroundColor: '#EFF6FF' }]}>
                <BriefcaseIcon size={18} color="#2563EB" />
              </View>
              <View style={[styles.subBadge, { backgroundColor: '#EFF6FF' }]}>
                <Text style={[styles.subBadgeText, { color: '#2563EB' }]}>대운 상승</Text>
              </View>
            </View>
            <Text style={styles.subCardTitle}>직업운</Text>
            <Text style={styles.subCardDesc}>
              10년 대운세 그래프 · 추천 이직 병원 · 동료 케미
            </Text>
          </TouchableOpacity>

          {/* 4. 금전운 */}
          <TouchableOpacity
            style={styles.subCard}
            onPress={onOpenWealth}
            activeOpacity={0.8}
          >
            <View style={styles.subCardHeader}>
              <View style={[styles.iconCircle, { backgroundColor: '#FEF3C7' }]}>
                <CoinsIcon size={18} color="#D97706" />
              </View>
              <View style={[styles.subBadge, { backgroundColor: '#FEF3C7' }]}>
                <Text style={[styles.subBadgeText, { color: '#D97706' }]}>재물 유입</Text>
              </View>
            </View>
            <Text style={styles.subCardTitle}>금전운</Text>
            <Text style={styles.subCardDesc}>
              사주 재테크 전략 · 자산 배분 표 · 재물 타임라인
            </Text>
          </TouchableOpacity>
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
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  sectionHint: {
    fontSize: 12,
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
    fontSize: 12,
    fontWeight: '600',
    color: '#B8922E',
  },
  fortuneUpgradeLink: {
    fontSize: 12,
    fontWeight: '700',
    color: '#B8922E',
  },
  subFortuneGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  subCard: {
    width: '48%',
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
    minHeight: 120,
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
    fontSize: 10,
    fontWeight: '700',
  },
  subCardTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 4,
  },
  subCardDesc: {
    fontSize: 11,
    color: COLORS.textMuted,
    lineHeight: 15,
  },
});

