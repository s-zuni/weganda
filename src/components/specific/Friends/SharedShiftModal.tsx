import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import { COLORS } from '../../../constants/theme';
import { FriendDetail } from '../../../mocks/friendsData';
import { CommentIcon } from '../../common/Icon';
import { SwipeableBottomSheet } from '../../common/SwipeableBottomSheet';

interface SharedShiftModalProps {
  visible: boolean;
  friends: FriendDetail[];
  onClose: () => void;
  onOpenChat: (friend: FriendDetail) => void;
}

type TabType = 'same_day' | 'handover';

export const SharedShiftModal: React.FC<SharedShiftModalProps> = ({
  visible,
  friends,
  onClose,
  onOpenChat,
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('same_day');

  // 오늘 나와 같은 Day 근무인 동기 4명 (김민지, 송지원 등)
  const sameDayFriends = friends.filter((f) => f.todayShift === 'D');
  // 오늘 나(Day)에게 인수인계를 받을 이브닝 파트너 3명 (한준혁, 최수진, 강다은)
  const handoverFriends = friends.filter((f) => f.todayShift === 'E');

  const displayed = activeTab === 'same_day' ? sameDayFriends : handoverFriends;

  return (
    <SwipeableBottomSheet visible={visible} onClose={onClose} height="85%" maxHeight="90%">
      {/* 헤더 */}
      <View style={styles.header}>
            <View>
              <Text style={styles.headerTitle}>오늘 나와 겹치는 근무 동기</Text>
              <Text style={styles.headerSub}>
                {sameDayFriends.length + handoverFriends.length > 0
                  ? `총 ${sameDayFriends.length + handoverFriends.length}명의 동료와 오늘 병원에서 함께 호흡을 맞춰요`
                  : '오늘 등록된 동료들의 근무 일정을 확인해보세요'}
              </Text>
            </View>
            <TouchableOpacity onPress={onClose} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
              <Text style={styles.closeText}>닫기</Text>
            </TouchableOpacity>
          </View>

          {/* 탭 네비게이션 */}
          <View style={styles.tabRow}>
            <TouchableOpacity
              style={[styles.tabBtn, activeTab === 'same_day' && styles.tabBtnActive]}
              onPress={() => setActiveTab('same_day')}
            >
              <Text style={[styles.tabText, activeTab === 'same_day' && styles.tabTextActive]}>
                같은 데이(Day) 동행 ({sameDayFriends.length}명)
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.tabBtn, activeTab === 'handover' && styles.tabBtnActive]}
              onPress={() => setActiveTab('handover')}
            >
              <Text style={[styles.tabText, activeTab === 'handover' && styles.tabTextActive]}>
                인수인계(Eve) 파트너 ({handoverFriends.length}명)
              </Text>
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
            {/* 상단 안내 박스 */}
            <View style={styles.infoBanner}>
              <Text style={styles.infoTitle}>
                {activeTab === 'same_day'
                  ? '☀️ 같은 시간 출근하고 퇴근하는 든든한 데이 콤비!'
                  : '🤝 오후 2시 30분 나에게 환자를 인계받을 이브닝 동료!'}
              </Text>
              <Text style={styles.infoDesc}>
                {activeTab === 'same_day'
                  ? '퇴근 후 커피 한잔이나 원내 식당 점심 식사를 함께 해보세요.'
                  : '정확하고 깔끔한 인수인계로 서로의 칼퇴를 응원해 주세요.'}
              </Text>
            </View>

            {/* 동료 카드 리스트 */}
            <View style={styles.cardList}>
              {displayed.length === 0 ? (
                <View style={styles.emptyNoticeBox}>
                  <Text style={styles.emptyNoticeText}>
                    {activeTab === 'same_day'
                      ? '오늘 나와 같은 데이(Day) 근무인 동기가 없습니다.'
                      : '오늘 인수인계 예정인 이브닝(Eve) 동료가 없습니다.'}
                  </Text>
                </View>
              ) : (
                displayed.map((item) => (
                  <View key={item.id} style={styles.friendCard}>
                    <View style={[styles.avatar, { backgroundColor: item.avatarBg }]}>
                      <Text style={styles.avatarText}>{item.avatarLetter}</Text>
                    </View>

                    <View style={styles.cardCenter}>
                      <View style={styles.nameRow}>
                        <Text style={styles.friendName}>{item.name}</Text>
                        <View
                          style={[
                            styles.shiftBadge,
                            { backgroundColor: item.todayShift === 'D' ? '#4F98CA' : '#E2703A' },
                          ]}
                        >
                          <Text style={styles.shiftBadgeText}>
                            {item.todayShift === 'D' ? 'Day' : 'Evening'}
                          </Text>
                        </View>
                      </View>
                      <Text style={styles.roleText}>{item.hospital} • {item.role}</Text>
                      {item.statusMessage ? (
                        <Text style={styles.statusText} numberOfLines={1}>
                          "{item.statusMessage}"
                        </Text>
                      ) : null}
                    </View>

                    <TouchableOpacity
                      style={styles.chatActionBtn}
                      onPress={() => {
                        onClose();
                        onOpenChat(item);
                      }}
                      activeOpacity={0.8}
                    >
                      <CommentIcon size={14} color={COLORS.primary} />
                      <Text style={styles.chatActionText}>톡하기</Text>
                    </TouchableOpacity>
                  </View>
                ))
              )}
            </View>
          </ScrollView>
    </SwipeableBottomSheet>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    maxHeight: '85%',
    paddingBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 10,
  },
  handleBar: {
    width: 40,
    height: 4,
    backgroundColor: '#E5E7EB',
    borderRadius: 2,
    alignSelf: 'center',
    marginTop: 10,
    marginBottom: 8,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  headerSub: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  closeText: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.textMuted,
  },
  tabRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#F9FAFB',
    gap: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  tabBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 12,
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  tabBtnActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  tabText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.textSecondary,
  },
  tabTextActive: {
    color: '#FFFFFF',
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 30,
  },
  infoBanner: {
    backgroundColor: '#FFF1F4',
    borderRadius: 14,
    padding: 14,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.primary,
    marginBottom: 16,
  },
  infoTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: COLORS.primary,
    marginBottom: 3,
  },
  infoDesc: {
    fontSize: 12,
    color: COLORS.textSecondary,
    lineHeight: 17,
  },
  cardList: {
    gap: 12,
  },
  friendCard: {
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
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  cardCenter: {
    flex: 1,
    marginLeft: 12,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 2,
  },
  friendName: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  shiftBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  shiftBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  roleText: {
    fontSize: 12,
    color: COLORS.textMuted,
  },
  statusText: {
    fontSize: 11,
    color: COLORS.textSecondary,
    marginTop: 2,
    fontStyle: 'italic',
  },
  chatActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FFF1F4',
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 10,
  },
  chatActionText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.primary,
  },
  emptyNoticeBox: {
    paddingVertical: 36,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderStyle: 'dashed',
    marginVertical: 10,
  },
  emptyNoticeText: {
    fontSize: 13,
    color: COLORS.textMuted,
    textAlign: 'center',
    lineHeight: 18,
  },
});

export default SharedShiftModal;

