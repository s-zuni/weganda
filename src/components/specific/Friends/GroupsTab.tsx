import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Modal,
  TextInput,
  ScrollView,
  Platform,
} from 'react-native';
import { COLORS, TINT_COLORS, useAppTheme } from '../../../constants/theme';
import {
  PlusIcon,
  UsersIcon,
  CalendarIcon,
  LockIcon,
} from '../../common/Icon';
import { GroupChat, FriendDetail } from '../../../types/friends';
import { useFriendsStore } from '../../../store/useFriendsStore';
import { CreateGroupModal } from './CreateGroupModal';

interface GroupsTabProps {
  groupChats: GroupChat[];
  isPremium?: boolean;
  onOpenGroup: (group: GroupChat) => void;
  onOpenPaywall?: () => void;
}

export const GroupsTab: React.FC<GroupsTabProps> = ({
  groupChats,
  onOpenGroup,
}) => {
  const theme = useAppTheme();
  const { friends, createGroupChat } = useFriendsStore();
  const [createModalVisible, setCreateModalVisible] = useState(false);

  const handleCreateGroup = (name: string, category: string, chosenFriends: typeof friends) => {
    createGroupChat(name, category, chosenFriends);
    Alert.alert('개설 완료', `'${name}' 모임 방이 성공적으로 생성되었습니다!`);
  };

  return (
    <View style={styles.groupContainer}>
      <View style={styles.groupNoticeCard}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
          <Text style={styles.groupNoticeTitle}>구성원 스케줄 한눈에 비교하기</Text>
          {groupChats.length > 0 && (
            <TouchableOpacity
              onPress={() => setCreateModalVisible(true)}
              style={[styles.smallCreateBtn, { backgroundColor: theme.primary }]}
              activeOpacity={0.8}
            >
              <Text style={[styles.smallCreateBtnText, { color: theme.onPrimaryText }]}>+ 모임 개설</Text>
            </TouchableOpacity>
          )}
        </View>
        <Text style={styles.groupNoticeSub}>
          단체 톡방을 터치하면 단원들의 이번 달 듀티(D/E/N/O)를 한 표에서 교차 대조할 수 있습니다.
        </Text>
      </View>

      {groupChats.length === 0 ? (
        <View style={styles.emptyCardBox}>
          <Text style={styles.emptyCardIcon}>💬</Text>
          <Text style={styles.emptyCardTitle}>참여 중인 단체 모임이 없어요</Text>
          <Text style={styles.emptyCardSub}>
            병동이나 동기 모임을 만들어 여러 명의 스케줄을 한눈에 비교해보세요!
          </Text>
          <TouchableOpacity
            style={[styles.emptyAddBtn, { backgroundColor: theme.primary }]}
            onPress={() => setCreateModalVisible(true)}
            activeOpacity={0.85}
          >
            <PlusIcon size={14} color={COLORS.background} />
            <Text style={[styles.emptyAddBtnText, { color: theme.onPrimaryText }]}>새 모임 만들기</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.groupList}>
          {groupChats.map((group) => (
            <TouchableOpacity
              key={group.id}
              style={styles.groupCard}
              onPress={() => onOpenGroup(group)}
              activeOpacity={0.8}
            >
              <View style={styles.groupTopRow}>
                <View style={styles.groupLeft}>
                  <View style={styles.groupIconCircle}>
                    <UsersIcon size={20} color={COLORS.primary} />
                  </View>
                  <View>
                    <View style={styles.groupNameRow}>
                      <Text style={styles.groupName}>{group.name}</Text>
                      <View style={styles.groupCategoryBadge}>
                        <Text style={styles.groupCategoryText}>{group.category}</Text>
                      </View>
                    </View>
                    <Text style={styles.groupMembersPreview}>
                      {group.members.map((m) => m.name).join(', ')}
                    </Text>
                  </View>
                </View>

                {group.unreadCount > 0 && (
                  <View style={styles.unreadBadge}>
                    <Text style={styles.unreadBadgeText}>{group.unreadCount}</Text>
                  </View>
                )}
              </View>

              <View style={styles.groupDivider} />

              <View style={styles.groupBottomRow}>
                <Text style={styles.lastMessageText} numberOfLines={1}>
                  {group.lastMessage}
                </Text>
                <View style={styles.matrixBtnBadge}>
                  <CalendarIcon size={12} color={theme.primary} />
                  <Text style={[styles.matrixBtnText, { color: theme.primary }]}>스케줄 비교 ›</Text>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* AI 모임 날짜 추천 (전면 무료) */}
      <TouchableOpacity
        style={styles.aiRecommendBtn}
        onPress={() => {
          Alert.alert(
            'AI 모임 날짜 추천',
            '단원들의 듀티를 분석하여 최적의 공통 오프 날짜를 찾았습니다!\n\n✨ 추천 날짜: 9월 14일 (일) 전원 휴무 (Golden Off)'
          );
        }}
        activeOpacity={0.8}
      >
        <View style={styles.aiRecommendContent}>
          <Text style={styles.aiRecommendText}>
            ✨ AI 모임 날짜 추천하기
          </Text>
        </View>
      </TouchableOpacity>

      {/* ── 단체 모임 개설 모달 ── */}
      <CreateGroupModal
        visible={createModalVisible}
        onClose={() => setCreateModalVisible(false)}
        friends={friends}
        onCreateGroup={handleCreateGroup}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  groupContainer: {
    marginTop: 4,
  },
  groupNoticeCard: {
    backgroundColor: TINT_COLORS.pinkTint,
    borderRadius: 16,
    padding: 14,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.primary,
    marginBottom: 16,
  },
  groupNoticeTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: COLORS.primary,
    marginBottom: 4,
  },
  groupNoticeSub: {
    fontSize: 14,
    color: COLORS.textSecondary,
    lineHeight: 20,
  },
  groupList: {
    gap: 12,
  },
  groupCard: {
    backgroundColor: COLORS.cardBackground,
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  groupTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  groupLeft: {
    flexDirection: 'row',
    gap: 12,
    flex: 1,
  },
  groupIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: TINT_COLORS.pinkTint,
    alignItems: 'center',
    justifyContent: 'center',
  },
  groupNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 3,
  },
  groupName: {
    fontSize: 17,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  groupCategoryBadge: {
    backgroundColor: COLORS.divider,
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6,
  },
  groupCategoryText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  groupMembersPreview: {
    fontSize: 13,
    color: COLORS.textMuted,
  },
  unreadBadge: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 10,
  },
  unreadBadgeText: {
    fontSize: 11,
    fontWeight: '800',
    color: COLORS.background,
  },
  groupDivider: {
    height: 1,
    backgroundColor: COLORS.divider,
    marginVertical: 12,
  },
  groupBottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  lastMessageText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    flex: 1,
    marginRight: 10,
  },
  matrixBtnBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: TINT_COLORS.pinkTint,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  matrixBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.primary,
  },
  emptyCardBox: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 48,
    paddingHorizontal: 24,
    backgroundColor: COLORS.offWhite,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderStyle: 'dashed',
    marginVertical: 14,
  },
  emptyCardIcon: {
    fontSize: 36,
    marginBottom: 12,
  },
  emptyCardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 6,
    textAlign: 'center',
  },
  emptyCardSub: {
    fontSize: 15,
    color: COLORS.textMuted,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 18,
  },
  emptyAddBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: COLORS.primary,
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 20,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  emptyAddBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.background,
  },
  aiRecommendBtn: {
    backgroundColor: COLORS.primary,
    borderRadius: 16,
    paddingVertical: 15,
    paddingHorizontal: 20,
    marginTop: 16,
    marginBottom: 12,
    alignItems: 'center',
  },
  aiRecommendBtnLocked: {
    backgroundColor: COLORS.divider,
  },
  aiRecommendContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  aiRecommendText: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.background,
  },
  aiRecommendTextLocked: {
    color: COLORS.textMuted,
  },
  smallCreateBtn: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  smallCreateBtnText: {
    fontSize: 12,
    fontWeight: '800',
  },
});

export default GroupsTab;

