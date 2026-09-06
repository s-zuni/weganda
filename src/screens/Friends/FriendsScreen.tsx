import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TextInput,
  TouchableOpacity,
  StatusBar,
  Alert,
} from 'react-native';
import { AppHeader } from '../../components/common/AppHeader';
import { COLORS } from '../../constants/theme';
import { SHIFT_TYPES } from '../../constants/shiftTypes';
import { useFriendsStore } from '../../store/useFriendsStore';
import { useUserStore } from '../../store/useUserStore';
import { FriendDetail, GroupChat } from '../../mocks/friendsData';
import {
  StarIcon,
  SearchIcon,
  PlusIcon,
  UsersIcon,
  CommentIcon,
  CalendarIcon,
} from '../../components/common/Icon';

// 분리된 서브 모달 컴포넌트들 (직접 임포트)
import { FriendProfileModal } from '../../components/specific/Friends/FriendProfileModal';
import { ChatRoomModal } from '../../components/specific/Friends/ChatRoomModal';
import { GroupChatDetailModal } from '../../components/specific/Friends/GroupChatDetailModal';
import { SharedShiftModal } from '../../components/specific/Friends/SharedShiftModal';

type FriendsTabType = 'list' | 'groups';

export const FriendsScreen: React.FC = () => {
  const { id: userId } = useUserStore((s) => ({ id: s.id }));
  const { friends, groupChats, toggleFavorite, fetchFriends } = useFriendsStore();

  useEffect(() => {
    if (userId) {
      fetchFriends(userId);
    }
  }, [userId, fetchFriends]);

  const [activeTab, setActiveTab] = useState<FriendsTabType>('list');
  const [searchText, setSearchText] = useState('');

  // 겹치는 근무 친구 계산
  const overlappingFriends = friends.filter((f) => f.todayShift && f.todayShift !== 'O');

  // 모달 제어 상태
  const [selectedFriend, setSelectedFriend] = useState<FriendDetail | null>(null);
  const [profileModalVisible, setProfileModalVisible] = useState(false);
  const [chatFriend, setChatFriend] = useState<FriendDetail | null>(null);
  const [chatModalVisible, setChatModalVisible] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState<GroupChat | null>(null);
  const [groupModalVisible, setGroupModalVisible] = useState(false);
  const [sharedShiftModalVisible, setSharedShiftModalVisible] = useState(false);

  // 친구 검색 필터
  const filteredFriends = friends.filter(
    (f) =>
      f.name.includes(searchText) ||
      f.role.includes(searchText) ||
      f.hospital.includes(searchText)
  );

  // 즐겨찾기 친구와 일반 친구 분리
  const favoriteFriends = filteredFriends.filter((f) => f.isFavorite);
  const regularFriends = filteredFriends.filter((f) => !f.isFavorite);

  const handleOpenProfile = (friend: FriendDetail) => {
    setSelectedFriend(friend);
    setProfileModalVisible(true);
  };

  const handleOpenChat = (friend: FriendDetail) => {
    setChatFriend(friend);
    setChatModalVisible(true);
  };

  const handleProposeSwap = (friend: FriendDetail) => {
    setProfileModalVisible(false);
    setChatFriend(friend);
    setChatModalVisible(true);
  };

  const handleOpenGroup = (group: GroupChat) => {
    setSelectedGroup(group);
    setGroupModalVisible(true);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <AppHeader />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* ── 겹치는 근무 요약 상단 배너 (Shared Shift Banner) ── */}
        <TouchableOpacity
          style={styles.sharedBanner}
          onPress={() => {
            if (friends.length === 0) {
              Alert.alert(
                '동료 등록',
                '동기나 병동 동료를 등록하면 근무표가 실시간 연동되어 듀티 맞교환이 가능합니다.'
              );
            } else {
              setSharedShiftModalVisible(true);
            }
          }}
          activeOpacity={0.85}
        >
          <View style={styles.sharedBannerLeft}>
            <View style={styles.calendarIconWrapper}>
              <CalendarIcon size={18} color={COLORS.primary} />
            </View>
            <View style={styles.sharedTexts}>
              {friends.length === 0 ? (
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

        {/* ── 2단 세그먼트 탭 [친구 목록] vs [단체 톡방] ── */}
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tabSegment, activeTab === 'list' && styles.tabSegmentActive]}
            onPress={() => setActiveTab('list')}
            activeOpacity={0.8}
          >
            <Text style={[styles.tabSegmentText, activeTab === 'list' && styles.tabSegmentTextActive]}>
              친구 목록 ({friends.length})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tabSegment, activeTab === 'groups' && styles.tabSegmentActive]}
            onPress={() => setActiveTab('groups')}
            activeOpacity={0.8}
          >
            <Text style={[styles.tabSegmentText, activeTab === 'groups' && styles.tabSegmentTextActive]}>
              단체 톡방 & 스케줄 ({groupChats.length})
            </Text>
          </TouchableOpacity>
        </View>

        {/* ══════════ TAB 1: 친구 목록 ══════════ */}
        {activeTab === 'list' && (
          <View>
            {/* 검색 & 친구 추가 바 */}
            <View style={styles.searchRow}>
              <View style={styles.searchInputContainer}>
                <SearchIcon size={16} color={COLORS.textMuted} />
                <TextInput
                  style={styles.searchInput}
                  placeholder="동기 이름, 병원, 병동 검색"
                  placeholderTextColor={COLORS.textMuted}
                  value={searchText}
                  onChangeText={setSearchText}
                />
              </View>
              <TouchableOpacity
                style={styles.addBtn}
                onPress={() =>
                  Alert.alert(
                    '친구 추가',
                    '사내 메신저 연동 또는 사번/연락처로 동기를 검색하여 친구를 추가할 수 있습니다.'
                  )
                }
                activeOpacity={0.85}
              >
                <PlusIcon size={14} color="#FFFFFF" />
                <Text style={styles.addBtnText}>추가</Text>
              </TouchableOpacity>
            </View>

            {filteredFriends.length === 0 ? (
              <View style={styles.emptyCardBox}>
                <Text style={styles.emptyCardIcon}>👭</Text>
                <Text style={styles.emptyCardTitle}>
                  {searchText.trim() ? '일치하는 동료가 없어요' : '아직 등록된 동료가 없어요'}
                </Text>
                <Text style={styles.emptyCardSub}>
                  {searchText.trim()
                    ? '검색어를 다시 확인해보세요.'
                    : '동기나 친한 간호사를 추가하면\n실시간 근무표를 맞춰보고 듀티를 맞교환할 수 있어요!'}
                </Text>
                <TouchableOpacity
                  style={styles.emptyAddBtn}
                  onPress={() =>
                    Alert.alert(
                      '친구 추가',
                      '사내 메신저 연동 또는 사번/연락처로 동기를 검색하여 친구를 추가할 수 있습니다.'
                    )
                  }
                  activeOpacity={0.85}
                >
                  <PlusIcon size={14} color="#FFFFFF" />
                  <Text style={styles.emptyAddBtnText}>동료 추가하기</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <>
                {/* ── 1. 즐겨찾기(상단 고정) 친구 섹션 ── */}
                {favoriteFriends.length > 0 && (
                  <View style={styles.friendSection}>
                    <View style={styles.sectionHeaderRow}>
                      <View style={styles.sectionTitleGroup}>
                        <StarIcon size={16} color="#FFB800" filled={true} />
                        <Text style={styles.sectionTitle}>상단 고정 즐겨찾기 ({favoriteFriends.length})</Text>
                      </View>
                    </View>

                    <View style={styles.friendsList}>
                      {favoriteFriends.map((item) => renderFriendCard(item))}
                    </View>
                  </View>
                )}

                {/* ── 2. 일반 친구 목록 섹션 ── */}
                <View style={styles.friendSection}>
                  <View style={styles.sectionHeaderRow}>
                    <Text style={styles.sectionTitle}>전체 동기 ({regularFriends.length})</Text>
                  </View>

                  <View style={styles.friendsList}>
                    {regularFriends.map((item) => renderFriendCard(item))}
                  </View>
                </View>
              </>
            )}
          </View>
        )}

        {/* ══════════ TAB 2: 단체 톡방 & 전원 스케줄 일괄 비교 ══════════ */}
        {activeTab === 'groups' && (
          <View style={styles.groupContainer}>
            <View style={styles.groupNoticeCard}>
              <Text style={styles.groupNoticeTitle}>구성원 스케줄 한눈에 비교하기</Text>
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
                  style={styles.emptyAddBtn}
                  onPress={() =>
                    Alert.alert(
                      '모임 방 만들기',
                      '새로운 동기 모임이나 병동 스케줄 공유방을 개설할 수 있습니다.'
                    )
                  }
                  activeOpacity={0.85}
                >
                  <PlusIcon size={14} color="#FFFFFF" />
                  <Text style={styles.emptyAddBtnText}>새 모임 만들기</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.groupList}>
                {groupChats.map((group) => (
                  <TouchableOpacity
                    key={group.id}
                    style={styles.groupCard}
                    onPress={() => handleOpenGroup(group)}
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
                        <CalendarIcon size={12} color={COLORS.primary} />
                        <Text style={styles.matrixBtnText}>스케줄 비교 ›</Text>
                      </View>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>
        )}
      </ScrollView>

      {/* ── 4대 디테일 서브 모달들 ── */}
      <FriendProfileModal
        visible={profileModalVisible}
        friend={selectedFriend}
        onClose={() => setProfileModalVisible(false)}
        onOpenChat={(f) => {
          setProfileModalVisible(false);
          handleOpenChat(f);
        }}
        onProposeSwap={handleProposeSwap}
      />

      <ChatRoomModal
        visible={chatModalVisible}
        friend={chatFriend}
        onClose={() => setChatModalVisible(false)}
      />

      <GroupChatDetailModal
        visible={groupModalVisible}
        groupChat={selectedGroup}
        onClose={() => setGroupModalVisible(false)}
      />

      <SharedShiftModal
        visible={sharedShiftModalVisible}
        friends={friends}
        onClose={() => setSharedShiftModalVisible(false)}
        onOpenChat={(f) => handleOpenChat(f)}
      />
    </SafeAreaView>
  );

  // 친구 카드 렌더링 헬퍼
  function renderFriendCard(item: FriendDetail) {
    const shift = SHIFT_TYPES[item.todayShift];
    return (
      <TouchableOpacity
        key={item.id}
        style={styles.friendRow}
        onPress={() => handleOpenProfile(item)}
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
          <Text style={styles.friendRole}>{item.hospital} • {item.role}</Text>

          {/* 취침 상태 알림 (킬러 피처) */}
          {item.sleepStatus && (
            <View style={styles.miniSleepBadge}>
              <Text style={styles.miniSleepText}>취침 중 (연락자제)</Text>
            </View>
          )}
        </View>

        {/* 우측 액션 버튼들 */}
        <View style={styles.rightActionCol}>
          <TouchableOpacity
            style={styles.messageOutlineBtn}
            onPress={() => handleOpenChat(item)}
            activeOpacity={0.7}
          >
            <CommentIcon size={14} color={COLORS.primary} />
            <Text style={styles.messageOutlineText}>메시지</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  }
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: 20,
    paddingBottom: 90,
  },

  // SHARED BANNER
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
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  boldPink: {
    color: COLORS.primary,
    fontWeight: '800',
  },
  sharedBannerSub: {
    fontSize: 12,
    color: COLORS.primary,
    fontWeight: '600',
    marginTop: 2,
  },

  // SEGMENTED TABS
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#F3F4F6',
    borderRadius: 14,
    padding: 4,
    marginBottom: 18,
  },
  tabSegment: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
  },
  tabSegmentActive: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  tabSegmentText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  tabSegmentTextActive: {
    color: COLORS.primary,
    fontWeight: '800',
  },

  // SEARCH & ADD
  searchRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 20,
    alignItems: 'center',
  },
  searchInputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 14,
    paddingHorizontal: 14,
    height: 46,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    color: COLORS.textPrimary,
    paddingVertical: 0,
  },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: COLORS.primary,
    borderRadius: 14,
    paddingHorizontal: 14,
    height: 46,
    justifyContent: 'center',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 3,
  },
  addBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },

  // FRIEND SECTIONS
  friendSection: {
    marginBottom: 22,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitleGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  friendsList: {
    gap: 12,
  },
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
    marginBottom: 2,
  },
  friendName: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  shiftCodeBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  shiftCodeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  friendRole: {
    fontSize: 12,
    color: COLORS.textMuted,
  },
  miniSleepBadge: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    alignSelf: 'flex-start',
    marginTop: 3,
  },
  miniSleepText: {
    fontSize: 10,
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
    paddingVertical: 7,
    paddingHorizontal: 12,
    borderRadius: 12,
    backgroundColor: '#FFF1F4',
  },
  messageOutlineText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.primary,
  },

  // GROUP CHAT TAB
  groupContainer: {
    marginTop: 4,
  },
  groupNoticeCard: {
    backgroundColor: '#FFF1F4',
    borderRadius: 16,
    padding: 14,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.primary,
    marginBottom: 16,
  },
  groupNoticeTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: COLORS.primary,
    marginBottom: 4,
  },
  groupNoticeSub: {
    fontSize: 12,
    color: COLORS.textSecondary,
    lineHeight: 18,
  },
  groupList: {
    gap: 12,
  },
  groupCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
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
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#FFF1F4',
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
    fontSize: 15,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  groupCategoryBadge: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  groupCategoryText: {
    fontSize: 10,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  groupMembersPreview: {
    fontSize: 12,
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
    color: '#FFFFFF',
  },
  groupDivider: {
    height: 1,
    backgroundColor: '#F3F4F6',
    marginVertical: 12,
  },
  groupBottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  lastMessageText: {
    fontSize: 12,
    color: COLORS.textSecondary,
    flex: 1,
    marginRight: 10,
  },
  matrixBtnBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FFF1F4',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  matrixBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.primary,
  },
  // EMPTY STATE STYLES
  emptyCardBox: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 48,
    paddingHorizontal: 24,
    backgroundColor: '#F9FAFB',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderStyle: 'dashed',
    marginVertical: 14,
  },
  emptyCardIcon: {
    fontSize: 36,
    marginBottom: 12,
  },
  emptyCardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 6,
    textAlign: 'center',
  },
  emptyCardSub: {
    fontSize: 13,
    color: COLORS.textMuted,
    textAlign: 'center',
    lineHeight: 19,
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
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});

export default FriendsScreen;
