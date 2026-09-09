import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { COLORS } from '../../../constants/theme';
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
  return (
    <TouchableOpacity
      style={styles.sharedBanner}
      onPress={onPress}
      activeOpacity={0.85}
    >
      <View style={styles.sharedBannerLeft}>
        <View style={styles.calendarIconWrapper}>
          <CalendarIcon size={18} color={COLORS.primary} />
        </View>
        <View style={styles.sharedTexts}>
          {friendsCount === 0 ? (
            <>
              <Text style={styles.sharedBannerTitle}>
                동료를 등록하고 듀티를 맞춰보세요 👭
              </Text>
              <Text style={styles.sharedBannerSub}>
                서로의 근무표를 확인하고 간편하게 듀티를 교환해보세요 ›
              </Text>
            </>
          ) : (
            <>
              <Text style={styles.sharedBannerTitle}>
                {overlappingFriends.length > 0 ? (
                  <>
                    오늘 {overlappingFriends[0].name}님 등{' '}
                    <Text style={styles.boldPink}>{overlappingFriends.length}명</Text>과 근무가 겹쳐요!
                  </>
                ) : (
                  '오늘 등록된 동료들의 근무 일정을 확인해보세요!'
                )}
              </Text>
              <Text style={styles.sharedBannerSub}>
                {overlappingFriends.length > 0
                  ? '실시간 근무표 및 인계 파트너 확인하기 ›'
                  : '동료 프로필 및 이번 달 스케줄 비교하기 ›'}
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
    backgroundColor: '#FFF1F4',
    borderRadius: 16,
    padding: 14,
    marginTop: 6,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#FFE4EA',
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
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  boldPink: {
    color: COLORS.primary,
    fontWeight: '800',
  },
  sharedBannerSub: {
    fontSize: 14,
    color: COLORS.primary,
    fontWeight: '600',
    marginTop: 3,
  },
});

