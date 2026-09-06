import React from 'react';
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
import { SHIFT_TYPES, ShiftCode } from '../../../constants/shiftTypes';
import { FriendDetail } from '../../../mocks/friendsData';
import { useFriendsStore } from '../../../store/useFriendsStore';
import {
  StarIcon,
  RepeatIcon,
  CalendarIcon,
  CommentIcon,
} from '../../common/Icon';

interface FriendProfileModalProps {
  visible: boolean;
  friend: FriendDetail | null;
  onClose: () => void;
  onOpenChat: (friend: FriendDetail) => void;
  onProposeSwap: (friend: FriendDetail) => void;
}

// 임시 내 31일 스케줄 패턴 (비교용)
const MY_SHIFTS: ShiftCode[] = [
  'D', 'D', 'D', 'O', 'O', 'E', 'N', 'N', 'O', 'O', 'D',
  'D', 'E', 'E', 'O', 'O', 'N', 'N', 'O', 'D', 'D',
  'E', 'E', 'O', 'O', 'N', 'N', 'O', 'O', 'D', 'D',
];

export const FriendProfileModal: React.FC<FriendProfileModalProps> = ({
  visible,
  friend,
  onClose,
  onOpenChat,
  onProposeSwap,
}) => {
  const { toggleFavorite } = useFriendsStore();

  if (!friend) return null;

  const shiftInfo = SHIFT_TYPES[friend.todayShift];

  const handleToggleFav = () => {
    toggleFavorite(friend.id);
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={true} onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          {/* 핸들바 */}
          <View style={styles.handleBar} />

          {/* 헤더 */}
          <View style={styles.header}>
            <View style={styles.headerTitleRow}>
              <Text style={styles.headerTitle}>동기 프로필</Text>
              <TouchableOpacity
                style={styles.favoriteBtn}
                onPress={handleToggleFav}
                activeOpacity={0.7}
              >
                <StarIcon
                  size={20}
                  color={friend.isFavorite ? '#FFB800' : '#D1D5DB'}
                  filled={friend.isFavorite}
                />
                <Text
                  style={[
                    styles.favoriteText,
                    friend.isFavorite && styles.favoriteTextActive,
                  ]}
                >
                  {friend.isFavorite ? '상단 고정됨' : '즐겨찾기'}
                </Text>
              </TouchableOpacity>
            </View>
            <TouchableOpacity onPress={onClose} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
              <Text style={styles.closeText}>닫기</Text>
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
            {/* ── 프로필 상단 카드 ── */}
            <View style={styles.profileCard}>
              <View style={styles.profileTopRow}>
                <View style={[styles.avatar, { backgroundColor: friend.avatarBg }]}>
                  <Text style={styles.avatarText}>{friend.avatarLetter}</Text>
                </View>

                <View style={styles.profileInfo}>
                  <View style={styles.nameDutyRow}>
                    <Text style={styles.friendName}>{friend.name}</Text>
                    <View style={[styles.dutyBadge, { backgroundColor: shiftInfo.color }]}>
                      <Text style={styles.dutyBadgeText}>오늘 {shiftInfo.shortName} ({shiftInfo.code})</Text>
                    </View>
                  </View>
                  <Text style={styles.hospitalText}>{friend.hospital} • {friend.ward}</Text>
                  <Text style={styles.roleText}>{friend.role}</Text>
                </View>
              </View>

              {/* 상태 메시지 */}
              {friend.statusMessage && (
                <View style={styles.statusMessageBox}>
                  <Text style={styles.statusMessageText}>"{friend.statusMessage}"</Text>
                </View>
              )}

              {/* 취침 중 방해금지 뱃지 (킬러 피처) */}
              {friend.sleepStatus && (
                <View style={styles.sleepStatusBox}>
                  <View style={styles.sleepDot} />
                  <Text style={styles.sleepStatusText}>{friend.sleepStatus}</Text>
                </View>
              )}
            </View>

            {/* ── 오프 겹치는 날 요약 배너 ── */}
            <View style={styles.offSyncBanner}>
              <View style={styles.offSyncLeft}>
                <Text style={styles.offSyncTitle}>
                  이번 달 둘 다 쉬는 날 <Text style={styles.boldPink}>{friend.matchingOffDaysCount}일</Text> 겹쳐요!
                </Text>
                <Text style={styles.offSyncSub}>함께 힐링 나들이나 카페 약속을 계획해보세요.</Text>
              </View>
            </View>

            {/* ── 2열 스케줄 대조표 (내 듀티 vs 친구 듀티) ── */}
            <View style={styles.scheduleHeaderRow}>
              <View style={styles.scheduleTitleGroup}>
                <CalendarIcon size={18} color={COLORS.primary} />
                <Text style={styles.sectionHeading}>9월 듀티 스케줄 대조</Text>
              </View>
              <Text style={styles.scrollHint}>좌우 스크롤</Text>
            </View>

            <View style={styles.calendarContainer}>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View style={styles.calendarGrid}>
                  {/* 날짜 행 */}
                  <View style={styles.calendarRow}>
                    <View style={styles.rowLabelCell}>
                      <Text style={styles.rowLabelText}>일자</Text>
                    </View>
                    {friend.monthlyShifts.map((s) => (
                      <View key={`day_${s.day}`} style={styles.cellDay}>
                        <Text style={styles.dayNumText}>{s.day}</Text>
                      </View>
                    ))}
                  </View>

                  {/* 친구 듀티 행 */}
                  <View style={styles.calendarRow}>
                    <View style={styles.rowLabelCell}>
                      <Text style={styles.rowLabelText}>{friend.name.slice(1)}</Text>
                    </View>
                    {friend.monthlyShifts.map((s) => {
                      const color = SHIFT_TYPES[s.shift]?.color || '#9CA3AF';
                      return (
                        <View key={`f_shift_${s.day}`} style={styles.cellShift}>
                          <View style={[styles.shiftDot, { backgroundColor: color }]}>
                            <Text style={styles.shiftDotText}>{s.shift}</Text>
                          </View>
                        </View>
                      );
                    })}
                  </View>

                  {/* 내 듀티 행 */}
                  <View style={styles.calendarRow}>
                    <View style={styles.rowLabelCell}>
                      <Text style={[styles.rowLabelText, { color: COLORS.primary }]}>나</Text>
                    </View>
                    {friend.monthlyShifts.map((s, idx) => {
                      const myShift = MY_SHIFTS[idx % MY_SHIFTS.length];
                      const color = SHIFT_TYPES[myShift]?.color || '#9CA3AF';
                      const isBothOff = s.shift === 'O' && myShift === 'O';
                      return (
                        <View
                          key={`my_shift_${s.day}`}
                          style={[styles.cellShift, isBothOff && styles.bothOffCell]}
                        >
                          <View style={[styles.shiftDot, { backgroundColor: color }]}>
                            <Text style={styles.shiftDotText}>{myShift}</Text>
                          </View>
                        </View>
                      );
                    })}
                  </View>
                </View>
              </ScrollView>
            </View>

            {/* 범례 */}
            <View style={styles.legendRow}>
              <View style={styles.legendItem}>
                <View style={[styles.miniDot, { backgroundColor: '#4F98CA' }]} />
                <Text style={styles.legendText}>Day</Text>
              </View>
              <View style={styles.legendItem}>
                <View style={[styles.miniDot, { backgroundColor: '#E2703A' }]} />
                <Text style={styles.legendText}>Evening</Text>
              </View>
              <View style={styles.legendItem}>
                <View style={[styles.miniDot, { backgroundColor: '#272727' }]} />
                <Text style={styles.legendText}>Night</Text>
              </View>
              <View style={styles.legendItem}>
                <View style={[styles.miniDot, { backgroundColor: '#E84A5F' }]} />
                <Text style={styles.legendText}>Off</Text>
              </View>
              <View style={styles.legendItem}>
                <View style={[styles.miniSquare, { backgroundColor: '#FFE8EE' }]} />
                <Text style={styles.legendText}>동시 Off</Text>
              </View>
            </View>

            {/* ── 하단 액션 버튼 그룹 ── */}
            <View style={styles.actionBtnRow}>
              <TouchableOpacity
                style={styles.swapBtn}
                onPress={() => onProposeSwap(friend)}
                activeOpacity={0.85}
              >
                <RepeatIcon size={18} color={COLORS.primary} />
                <Text style={styles.swapBtnText}>듀티 맞교환 제안</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.messageBtn}
                onPress={() => onOpenChat(friend)}
                activeOpacity={0.85}
              >
                <CommentIcon size={18} color="#FFFFFF" />
                <Text style={styles.messageBtnText}>1:1 메시지 보내기</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
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
    maxHeight: '92%',
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
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  favoriteBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#F9FAFB',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  favoriteText: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  favoriteTextActive: {
    color: '#D97706',
    fontWeight: '700',
  },
  closeText: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.textMuted,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 30,
  },
  profileCard: {
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
    marginBottom: 16,
  },
  profileTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  profileInfo: {
    flex: 1,
  },
  nameDutyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 3,
  },
  friendName: {
    fontSize: 17,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  dutyBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  dutyBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  hospitalText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  roleText: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginTop: 1,
  },
  statusMessageBox: {
    backgroundColor: '#F9FAFB',
    borderRadius: 10,
    padding: 10,
    marginTop: 12,
  },
  statusMessageText: {
    fontSize: 12,
    color: COLORS.textPrimary,
    fontStyle: 'italic',
  },
  sleepStatusBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FEF3C7',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
    marginTop: 10,
  },
  sleepDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#D97706',
  },
  sleepStatusText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#B45309',
  },
  offSyncBanner: {
    backgroundColor: '#FFF1F4',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: '#FFE4EA',
    marginBottom: 20,
  },
  offSyncLeft: {
    gap: 2,
  },
  offSyncTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  boldPink: {
    color: COLORS.primary,
    fontWeight: '800',
  },
  offSyncSub: {
    fontSize: 11,
    color: COLORS.textSecondary,
  },
  scheduleHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  scheduleTitleGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  sectionHeading: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  scrollHint: {
    fontSize: 11,
    color: COLORS.textMuted,
  },
  calendarContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 10,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginBottom: 10,
  },
  calendarGrid: {
    flexDirection: 'column',
    gap: 4,
  },
  calendarRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rowLabelCell: {
    width: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowLabelText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.textSecondary,
  },
  cellDay: {
    width: 28,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayNumText: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.textMuted,
  },
  cellShift: {
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 4,
  },
  bothOffCell: {
    backgroundColor: '#FFF1F4',
    borderWidth: 1,
    borderColor: COLORS.primaryLight,
  },
  shiftDot: {
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  shiftDotText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  legendRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
    marginBottom: 20,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  miniDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  miniSquare: {
    width: 10,
    height: 10,
    borderRadius: 2,
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
  legendText: {
    fontSize: 10,
    color: COLORS.textMuted,
    fontWeight: '600',
  },
  actionBtnRow: {
    flexDirection: 'row',
    gap: 10,
  },
  swapBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: COLORS.primary,
    borderRadius: 14,
    paddingVertical: 14,
    gap: 6,
  },
  swapBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.primary,
  },
  messageBtn: {
    flex: 1.2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
    borderRadius: 14,
    paddingVertical: 14,
    gap: 6,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 4,
  },
  messageBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});

export default FriendProfileModal;
