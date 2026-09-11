import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { AppHeader } from '../../components/common/AppHeader';
import { COLORS } from '../../constants/theme';
import { useFriendsStore } from '../../store/useFriendsStore';
import { useUserStore } from '../../store/useUserStore';
import { FriendDetail, GroupChat } from '../../types/friends';
// 분리된 서브 모달 및 컴포넌트들
import {
  FriendProfileModal,
  ChatRoomModal,
  GroupChatDetailModal,
  SharedShiftModal,
  SharedShiftBanner,
  FriendsListTab,
  GroupsTab,
  AddFriendModal,
} from '../../components/specific/Friends';

type FriendsTabType = 'list' | 'groups';

export const FriendsScreen: React.FC = () => {
  const { id: userId, isPremium } = useUserStore((s) => ({ id: s.id, isPremium: s.isPremium }));
  const { friends, groupChats, fetchFriends, isLoading } = useFriendsStore();

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
  const [addFriendModalVisible, setAddFriendModalVisible] = useState(false);

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

  const handleAddFriend = () => {
    setAddFriendModalVisible(true);
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
        {/* 겹치는 근무 요약 상단 배너 */}
        <SharedShiftBanner
          friendsCount={friends.length}
          overlappingFriends={overlappingFriends}
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
        />

        {/* 2단 세그먼트 탭 [친구 목록] vs [단체 톡방] */}
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tabSegment, activeTab === 'list' && styles.tabSegmentActive]}
            onPress={() => setActiveTab('list')}
            activeOpacity={0.8}
          >
            <Text
              style={[
                styles.tabSegmentText,
                activeTab === 'list' && styles.tabSegmentTextActive,
              ]}
            >
              친구 목록 ({friends.length})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tabSegment, activeTab === 'groups' && styles.tabSegmentActive]}
            onPress={() => setActiveTab('groups')}
            activeOpacity={0.8}
          >
            <Text
              style={[
                styles.tabSegmentText,
                activeTab === 'groups' && styles.tabSegmentTextActive,
              ]}
            >
              단체 톡방 & 스케줄 ({groupChats.length})
            </Text>
          </TouchableOpacity>
        </View>

        {/* TAB 1: 친구 목록 */}
        {activeTab === 'list' && (
          isLoading && friends.length === 0 ? (
            <View style={{ paddingVertical: 48, alignItems: 'center' }}>
              <ActivityIndicator color={COLORS.primary} size="large" />
              <Text style={{ marginTop: 12, color: COLORS.textMuted, fontSize: 14 }}>친구 목록을 불러오는 중입니다...</Text>
            </View>
          ) : (
            <FriendsListTab
              searchText={searchText}
              onSearchTextChange={setSearchText}
              filteredFriends={filteredFriends}
              favoriteFriends={favoriteFriends}
              regularFriends={regularFriends}
              onAddFriend={handleAddFriend}
              onOpenProfile={handleOpenProfile}
              onOpenChat={handleOpenChat}
            />
          )
        )}

        {/* TAB 2: 단체 톡방 & 전원 스케줄 일괄 비교 */}
        {activeTab === 'groups' && (
          <GroupsTab
            groupChats={groupChats}
            isPremium={isPremium}
            onOpenGroup={handleOpenGroup}
          />
        )}
      </ScrollView>

      {/* 4대 디테일 서브 모달들 */}
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

      {/* 👥 동료 간호사 친구 추가 모달 (7자리 고유번호 & 연락처 수동 추가) */}
      <AddFriendModal
        visible={addFriendModalVisible}
        onClose={() => setAddFriendModalVisible(false)}
      />
    </SafeAreaView>
  );
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
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  tabSegmentTextActive: {
    color: COLORS.primary,
    fontWeight: '800',
  },
});

export default FriendsScreen;
