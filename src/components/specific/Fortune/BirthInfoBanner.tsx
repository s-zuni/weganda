import React, { useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { COLORS, useAppTheme, type ThemeColors } from '../../../constants/theme';
import { SparklesIcon } from '../../common/Icon';
import { BirthInfo } from '../../../types/fortune';

interface BirthInfoBannerProps {
  birthInfo: BirthInfo;
  onPress: () => void;
}

export const BirthInfoBanner: React.FC<BirthInfoBannerProps> = ({
  birthInfo,
  onPress,
}) => {
  const theme = useAppTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  return (
    <TouchableOpacity
      style={styles.birthBanner}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <View style={styles.birthBannerLeft}>
        <View style={styles.birthIconDot}>
          <SparklesIcon size={18} color={theme.primary} />
        </View>
        <View style={styles.birthInfoTexts}>
          <Text style={styles.birthBannerTitle}>
            {birthInfo.isRegistered && birthInfo.birthDate
              ? `🔮 ${birthInfo.birthDate} (${birthInfo.calendarType === 'solar' ? '양력' : '음력'} ${birthInfo.birthTime || '시간 미상'})`
              : '🔮 사주 탄생 정보를 입력해주세요'}
          </Text>
          <Text style={styles.birthBannerSub}>
            {birthInfo.isRegistered
              ? '✨ 사주 탄생 정보 등록됨 (오행·대운 정밀 분석 적용)'
              : '생년월일시를 등록하면 정확한 AI 맞춤 운세를 분석해드려요 🍀'}
          </Text>
        </View>
      </View>
      <View style={styles.editBadge}>
        <Text style={styles.editBadgeText}>
          {birthInfo.isRegistered ? '수정 ›' : '등록 ›'}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

const createStyles = (theme: ThemeColors) => StyleSheet.create({
  birthBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: theme.primaryTint,
    borderRadius: 16,
    padding: 12,
    marginTop: 6,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: theme.primaryTintBorder,
  },
  birthBannerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  birthIconDot: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  birthInfoTexts: {
    flex: 1,
  },
  birthBannerTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  birthBannerSub: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginTop: 3,
  },
  editBadge: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  editBadgeText: {
    fontSize: 13,
    fontWeight: '700',
    color: theme.primary,
  },
});

