import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { COLORS } from '../../../constants/theme';
import { SHIFT_TYPES } from '../../../constants/shiftTypes';
import { StarIcon, CommentIcon } from '../../common/Icon';
import { FriendDetail } from '../../../types/friends';

interface FriendCardProps {
  item: FriendDetail;
  onOpenProfile: (friend: FriendDetail) => void;
  onOpenChat: (friend: FriendDetail) => void;
}

export const FriendCard: React.FC<FriendCardProps> = ({
  item,
  onOpenProfile,
  onOpenChat,
}) => {
  const shift = SHIFT_TYPES[item.todayShift];

  return (
    <TouchableOpacity
      style={styles.friendRow}
      onPress={() => onOpenProfile(item)}
      activeOpacity={0.8}
    >
      {/* 원형 아바타 */}
      <View style={[styles.avatar, { backgroundColor: item.avatarBg }]}>
        <Text style={styles.avatarText}>{item.avatarLetter}</Text>
      </View>

      {/* 정보 영역 */}
      <View style={styles.friendInfo}>
        <View style={styles.nameShiftRow}>
          <Text style={styles.friendName}>{item.name}</Text>
          <View style={[styles.shiftCodeBadge, { backgroundColor: shift.color }]}>
            <Text style={styles.shiftCodeText}>{shift.code}</Text>
          </View>
          {item.isFavorite && (
            <StarIcon size={14} color="#FFB800" filled={true} />
          )}
        </View>
        <Text style={styles.friendRole}>
          {item.hospital} • {item.role}
        </Text>

        {/* 취침 상태 알림 */}
        {item.sleepStatus && (
          <View style={styles.miniSleepBadge}>
            <Text style={styles.miniSleepText}>취침 중 (연락자제)</Text>
          </View>
        )}
      </View>

      {/* 우측 액션 버튼 */}
      <View style={styles.rightActionCol}>
        <TouchableOpacity
          style={styles.messageOutlineBtn}
          onPress={() => onOpenChat(item)}
          activeOpacity={0.7}
        >
          <CommentIcon size={14} color={COLORS.primary} />
          <Text style={styles.messageOutlineText}>메시지</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  friendRow: {
    flexDirection: 'row',
    alignItems: 'center',
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
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 17,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  friendInfo: {
    flex: 1,
    marginLeft: 12,
  },
  nameShiftRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  friendName: {
    fontSize: 17,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  shiftCodeBadge: {
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6,
  },
  shiftCodeText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  friendRole: {
    fontSize: 14,
    color: COLORS.textMuted,
  },
  miniSleepBadge: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    alignSelf: 'flex-start',
    marginTop: 4,
  },
  miniSleepText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#B45309',
  },
  rightActionCol: {
    alignItems: 'flex-end',
  },
  messageOutlineBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 12,
    backgroundColor: '#FFF1F4',
  },
  messageOutlineText: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.primary,
  },
});

