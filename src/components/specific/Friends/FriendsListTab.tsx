import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
} from 'react-native';
import { COLORS } from '../../../constants/theme';
import { StarIcon, SearchIcon, PlusIcon } from '../../common/Icon';
import { FriendDetail } from '../../../types/friends';
import { FriendCard } from './FriendCard';

interface FriendsListTabProps {
  searchText: string;
  onSearchTextChange: (text: string) => void;
  filteredFriends: FriendDetail[];
  favoriteFriends: FriendDetail[];
  regularFriends: FriendDetail[];
  onAddFriend: () => void;
  onOpenProfile: (friend: FriendDetail) => void;
  onOpenChat: (friend: FriendDetail) => void;
}

export const FriendsListTab: React.FC<FriendsListTabProps> = ({
  searchText,
  onSearchTextChange,
  filteredFriends,
  favoriteFriends,
  regularFriends,
  onAddFriend,
  onOpenProfile,
  onOpenChat,
}) => {
  return (
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
            onChangeText={onSearchTextChange}
          />
        </View>
        <TouchableOpacity
          style={styles.addBtn}
          onPress={onAddFriend}
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
            onPress={onAddFriend}
            activeOpacity={0.85}
          >
            <PlusIcon size={14} color="#FFFFFF" />
            <Text style={styles.emptyAddBtnText}>동료 추가하기</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          {/* 1. 즐겨찾기(상단 고정) 친구 섹션 */}
          {favoriteFriends.length > 0 && (
            <View style={styles.friendSection}>
              <View style={styles.sectionHeaderRow}>
                <View style={styles.sectionTitleGroup}>
                  <StarIcon size={16} color="#FFB800" filled={true} />
                  <Text style={styles.sectionTitle}>
                    상단 고정 즐겨찾기 ({favoriteFriends.length})
                  </Text>
                </View>
              </View>

              <View style={styles.friendsList}>
                {favoriteFriends.map((item) => (
                  <FriendCard
                    key={item.id}
                    item={item}
                    onOpenProfile={onOpenProfile}
                    onOpenChat={onOpenChat}
                  />
                ))}
              </View>
            </View>
          )}

          {/* 2. 일반 친구 목록 섹션 */}
          <View style={styles.friendSection}>
            <View style={styles.sectionHeaderRow}>
              <Text style={styles.sectionTitle}>전체 동기 ({regularFriends.length})</Text>
            </View>

            <View style={styles.friendsList}>
              {regularFriends.map((item) => (
                <FriendCard
                  key={item.id}
                  item={item}
                  onOpenProfile={onOpenProfile}
                  onOpenChat={onOpenChat}
                />
              ))}
            </View>
          </View>
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
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
    fontSize: 15,
    color: COLORS.textPrimary,
    paddingVertical: 0,
  },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: COLORS.primary,
    borderRadius: 14,
    paddingHorizontal: 16,
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
    fontSize: 14,
    fontWeight: '700',
  },
  friendSection: {
    marginBottom: 24,
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
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  friendsList: {
    gap: 12,
  },
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
    color: '#FFFFFF',
  },
});

