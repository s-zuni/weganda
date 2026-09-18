import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, NEUTRAL, TINT_COLORS } from '../../../constants/theme';
import { PREMIUM_COLORS } from '../../../constants/premiumTheme';

export interface SajuHeaderBarProps {
  topicTitle: string;
  totalCharCount: number;
  appliedGuideVersion?: string;
  summaryQuote: string;
  birthInfo: {
    year: number;
    month: number;
    day: number;
    isLunar: boolean;
    gender: 'female' | 'male';
  };
  onBack: () => void;
  onShare: () => void;
  onOpenGuideModal: () => void;
}

export const SajuHeaderBar: React.FC<SajuHeaderBarProps> = ({
  topicTitle,
  totalCharCount,
  appliedGuideVersion,
  summaryQuote,
  birthInfo,
  onBack,
  onShare,
  onOpenGuideModal,
}) => {
  return (
    <>
      {/* 상단 네비게이션 헤더 */}
      <View style={styles.navHeader}>
        <TouchableOpacity
          style={styles.navBtn}
          onPress={onBack}
          activeOpacity={0.7}
          accessibilityRole="button"
          accessibilityLabel="뒤로 가기"
        >
          <Ionicons name="chevron-back" size={24} color={NEUTRAL.gray800} />
        </TouchableOpacity>
        <Text style={styles.navTitle} numberOfLines={1}>
          {topicTitle}
        </Text>
        <TouchableOpacity
          style={styles.navBtn}
          onPress={onShare}
          activeOpacity={0.7}
          accessibilityRole="button"
          accessibilityLabel="공유하기"
        >
          <Ionicons name="share-outline" size={22} color={NEUTRAL.gray800} />
        </TouchableOpacity>
      </View>

      {/* 상단 명인 인증 헤더 카드 */}
      <View style={styles.masterBanner}>
        <View style={styles.masterBadgeRow}>
          <View style={styles.masterBadge}>
            <Ionicons name="medal" size={14} color={PREMIUM_COLORS.gold} />
            <Text style={styles.masterBadgeText}>50년 명인 정밀 사주 감정서</Text>
          </View>
          <Text style={styles.wordCountBadge}>
            심층 분석 {totalCharCount}자 수록
          </Text>
        </View>

        <TouchableOpacity
          style={styles.guideCertificationBadge}
          onPress={onOpenGuideModal}
          activeOpacity={0.7}
        >
          <Ionicons name="shield-checkmark" size={13} color={PREMIUM_COLORS.heroBg} />
          <Text style={styles.guideCertificationText}>
            사주 분석 가이드({appliedGuideVersion || 'v1.0.0'}) 준수 감정
          </Text>
          <Ionicons name="information-circle-outline" size={14} color={PREMIUM_COLORS.heroBg} />
        </TouchableOpacity>

        <Text style={styles.bannerTitle}>{topicTitle}</Text>
        <Text style={styles.summaryQuote}>{summaryQuote}</Text>

        <View style={styles.birthInfoTagRow}>
          <Text style={styles.birthInfoTag}>
            {birthInfo.year}. {birthInfo.month}. {birthInfo.day} ({birthInfo.isLunar ? '음력' : '양력'})
          </Text>
          <Text style={styles.birthInfoTag}>
            {birthInfo.gender === 'female' ? '여명(女命)' : '남명(男命)'}
          </Text>
        </View>
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  navHeader: {
    height: 52,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.divider,
  },
  navBtn: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  navTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: NEUTRAL.gray900,
    flex: 1,
    textAlign: 'center',
    marginHorizontal: 10,
  },
  masterBanner: {
    backgroundColor: PREMIUM_COLORS.heroBg,
    borderRadius: 20,
    padding: 20,
    marginBottom: 24,
  },
  masterBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  masterBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(212, 168, 83, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  masterBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: PREMIUM_COLORS.gold,
  },
  wordCountBadge: {
    fontSize: 11,
    fontWeight: '600',
    color: TINT_COLORS.greenTintBorder,
  },
  guideCertificationBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: TINT_COLORS.greenTint,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    alignSelf: 'flex-start',
    marginTop: 8,
    marginBottom: 4,
    gap: 4,
    borderWidth: 1,
    borderColor: TINT_COLORS.greenTintBorder,
  },
  guideCertificationText: {
    fontSize: 12,
    fontWeight: '700',
    color: TINT_COLORS.greenTextDark,
  },
  bannerTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: COLORS.onPrimaryText,
    marginBottom: 8,
  },
  summaryQuote: {
    fontSize: 13,
    color: TINT_COLORS.greenTintStrong,
    lineHeight: 19,
    fontStyle: 'italic',
    marginBottom: 14,
  },
  birthInfoTagRow: {
    flexDirection: 'row',
    gap: 8,
  },
  birthInfoTag: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    fontSize: 11,
    color: COLORS.onPrimaryText,
    fontWeight: '500',
  },
});

