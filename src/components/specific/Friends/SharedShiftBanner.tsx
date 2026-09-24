import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { COLORS, useAppTheme } from '../../../constants/theme';
import { CalendarIcon } from '../../common/Icon';
import { FriendDetail } from '../../../types/friends';

interface SharedShiftBannerProps {
  friendsCount: number;
  overlappingFriends: FriendDetail[];
  onPress: () => void;
}

export const SharedShiftBanner: React.FC<SharedShiftBannerProps> = ({
  friendsCount,
  overlappingFriends,
  onPress,
}) => {
  const theme = useAppTheme();

  return (
    <TouchableOpacity
      style={[
        styles.sharedBanner,
        { backgroundColor: theme.primary + '0D', borderColor: theme.primary + '20' },
      ]}
      onPress={onPress}
      activeOpacity={0.85}
    >
      <View style={styles.sharedBannerLeft}>
        <View style={styles.calendarIconWrapper}>
          <CalendarIcon size={18} color={theme.primary} />
        </View>
        <View style={styles.sharedTexts}>
          {friendsCount === 0 ? (
            <>
              <Text style={styles.sharedBannerTitle}>
                동료 등록 및 듀티 공유
              </Text>
              <Text style={[styles.sharedBannerSub, { color: theme.primary }]}>
                동료와 근무표를 비교해보세요 ›
              </Text>
            </>
          ) : (
            <>
              <Text style={styles.sharedBannerTitle}>
                {overlappingFriends.length > 0 ? (
                  <>
                    오늘 {overlappingFriends[0].name}님 등{' '}
                    <Text style={{ color: theme.primary, fontWeight: '800' }}>
                      {overlappingFriends.length}명
                    </Text>과 근무가 겹쳐요
                  </>
                ) : (
                  '오늘 동료 근무 일정'
                )}
              </Text>
              <Text style={[styles.sharedBannerSub, { color: theme.primary }]}>
                {overlappingFriends.length > 0
                  ? '인계 파트너 및 실시간 근무표 확인 ›'
                  : '이번 달 스케줄 비교하기 ›'}
              </Text>
            </>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  sharedBanner: {
    borderRadius: 16,
    padding: 14,
    marginTop: 6,
    marginBottom: 16,
    borderWidth: 1,
  },
  sharedBannerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  calendarIconWrapper: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sharedTexts: {
    flex: 1,
  },
  sharedBannerTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  sharedBannerSub: {
    fontSize: 13,
    fontWeight: '600',
    marginTop: 3,
  },
});

