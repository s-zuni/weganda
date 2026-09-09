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
} from 'react-native';
import { AppHeader } from '../../components/common/AppHeader';
import { COLORS } from '../../constants/theme';
import { useFriendsStore } from '../../store/useFriendsStore';
import { useUserStore } from '../../store/useUserStore';
import { FriendDetail, GroupChat } from '../../types/friends';
import { FREE_LIMITS } from '../../constants/membership';

// 분리된 서브 모달 및 컴포넌트들
import {
  FriendProfileModal,
  ChatRoomModal,
  GroupChatDetailModal,
  SharedShiftModal,
  SharedShiftBanner,
  FriendsListTab,
  GroupsTab,
} from '../../components/specific/Friends';
import { PaywallBottomSheet } from '../../components/common/PaywallBottomSheet';
import { MembershipScreen } from '../MyPage/MembershipScreen';

type FriendsTabType = 'list' | 'groups';

export const FriendsScreen: React.FC = () => {
  const { id: userId, isPremium } = useUserStore((s) => ({ id: s.id, isPremium: s.isPremium }));
  const { friends, groupChats, fetchFriends } = useFriendsStore();

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
  const [paywallVisible, setPaywallVisible] = useState(false);
  const [membershipVisible, setMembershipVisible] = useState(false);

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
    if (!isPremium && friends.length >= FREE_LIMITS.maxSharedCalendarFriends) {
      Alert.alert(
        '공유 캘린더 제한',
        `무료 회원은 최대 ${FREE_LIMITS.maxSharedCalendarFriends}명까지 공유 캘린더를 연동할 수 있어요.`,
        [
          { text: '확인', style: 'cancel' },
          { text: 'weganda+ 알아보기', onPress: () => setPaywallVisible(true) },
        ]
      );
      return;
    }
    Alert.alert(
      '친구 추가',
      '사내 메신저 연동 또는 사번/연락처로 동기를 검색하여 친구를 추가할 수 있습니다.'
    );
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
        )}

        {/* TAB 2: 단체 톡방 & 전원 스케줄 일괄 비교 */}
        {activeTab === 'groups' && (
          <GroupsTab
            groupChats={groupChats}
            isPremium={isPremium}
            onOpenGroup={handleOpenGroup}
            onOpenPaywall={() => setPaywallVisible(true)}
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

      <PaywallBottomSheet
        visible={paywallVisible}
        onClose={() => setPaywallVisible(false)}
        onSubscribe={() => {
          setPaywallVisible(false);
          setMembershipVisible(true);
        }}
        onLearnMore={() => {
          setPaywallVisible(false);
          setMembershipVisible(true);
        }}
        featureTitle="공유 캘린더 & AI 모임 추천"
        featureDescription="친구 수 제한 없이 듀티를 공유하고 AI가 최적의 모임 날짜를 추천"
      />
      <MembershipScreen
        visible={membershipVisible}
        onClose={() => setMembershipVisible(false)}
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
