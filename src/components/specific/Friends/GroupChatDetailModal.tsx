import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  TextInput,
} from 'react-native';
import { COLORS, TINT_COLORS, useAppTheme } from '../../../constants/theme';
import { SHIFT_TYPES } from '../../../constants/shiftTypes';
import { GroupChat } from '../../../mocks/friendsData';
import { CalendarIcon, SendIcon, UsersIcon } from '../../common/Icon';
import { useCommonSchedules, CommonScheduleItem } from '../../../hooks/useCommonSchedules';
import { CommonScheduleList } from './CommonScheduleList';

interface GroupChatDetailModalProps {
  visible: boolean;
  groupChat: GroupChat | null;
  onClose: () => void;
}

type TabMode = 'matrix' | 'chat';

export const GroupChatDetailModal: React.FC<GroupChatDetailModalProps> = ({
  visible,
  groupChat,
  onClose,
}) => {
  const theme = useAppTheme();
  const [activeTab, setActiveTab] = useState<TabMode>('matrix');
  const [messageText, setMessageText] = useState('');
  const [messages, setMessages] = useState<
    { id: string; sender: string; text: string; time: string; isMe?: boolean }[]
  >([
    { id: '1', sender: '김민지', text: '선생님들 이번 주 회식 날짜 언제가 좋을까요?', time: '오후 1:10' },
    { id: '2', sender: '한준혁', text: '저는 이번 주말 다 좋습니다!', time: '오후 1:12' },
    { id: '3', sender: '송지원', text: '스케줄 매트릭스 보니까 14일이랑 20일이 다 오프네요!', time: '오후 1:15' },
  ]);

  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth(); // 0-indexed

  // 커스텀 훅으로 추출된 공통 스케줄 로직
  const {
    commonSchedules,
    filteredCommonSchedules,
    filter: commonScheduleFilter,
    setFilter: setCommonScheduleFilter,
  } = useCommonSchedules(groupChat, currentYear, currentMonth);

  const handleShareCommonSchedule = (item: CommonScheduleItem) => {
    setActiveTab('chat');
    setMessages((prev) => [
      ...prev,
      {
        id: `gmsg_${Date.now()}`,
        sender: '나',
        text: `📢 [공통 스케줄] ${currentMonth + 1}월 ${item.day}일(${item.dayOfWeek}) : ${item.title} (${item.memberNames.join(', ')})`,
        time: '방금 전',
        isMe: true,
      },
    ]);
  };

  if (!groupChat) return null;

  const handleSendMessage = () => {
    if (!messageText.trim()) return;
    setMessages((prev) => [
      ...prev,
      {
        id: `gmsg_${Date.now()}`,
        sender: '나',
        text: messageText.trim(),
        time: '방금 전',
        isMe: true,
      },
    ]);
    setMessageText('');
  };

  // 31일 중 가장 오프(Off)가 많이 겹치는 날짜 찾기
  const days = Array.from({ length: 31 }, (_, i) => i + 1);

  return (
    <Modal visible={visible} animationType="slide" transparent={false} onRequestClose={onClose}>
      <View style={styles.container}>
        {/* 헤더 */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
            <Text style={[styles.backBtnText, { color: theme.primary }]}>‹ 뒤로</Text>
          </TouchableOpacity>

          <View style={styles.headerCenter}>
            <Text style={styles.headerTitle}>{groupChat.name}</Text>
            <Text style={styles.headerSub}>{groupChat.category} • 구성원 {groupChat.members.length}명</Text>
          </View>

          <View style={{ width: 40 }} />
        </View>

        {/* 탭 네비게이션 */}
        <View style={styles.tabRow}>
          <TouchableOpacity
            style={[
              styles.tabBtn,
              activeTab === 'matrix' && { backgroundColor: theme.primary, borderColor: theme.primary },
            ]}
            onPress={() => setActiveTab('matrix')}
          >
            <CalendarIcon size={16} color={activeTab === 'matrix' ? theme.onPrimaryText : COLORS.textSecondary} />
            <Text
              style={[
                styles.tabText,
                activeTab === 'matrix' && { color: theme.onPrimaryText },
              ]}
            >
              스케줄 비교
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.tabBtn,
              activeTab === 'chat' && { backgroundColor: theme.primary, borderColor: theme.primary },
            ]}
            onPress={() => setActiveTab('chat')}
          >
            <UsersIcon size={16} color={activeTab === 'chat' ? theme.onPrimaryText : COLORS.textSecondary} />
            <Text
              style={[
                styles.tabText,
                activeTab === 'chat' && { color: theme.onPrimaryText },
              ]}
            >
              단체 대화방
            </Text>
          </TouchableOpacity>
        </View>

        {/* ══════════ TAB 1: 전원 스케줄 비교 매트릭스 ══════════ */}
        {activeTab === 'matrix' && (
          <ScrollView style={styles.matrixScroll} contentContainerStyle={styles.matrixContent}>
            {/* 골든 오프(전원 휴무일) 추천 배너 */}
            <View style={[styles.goldenOffCard, { backgroundColor: theme.primaryTint, borderLeftColor: theme.primary }]}>
              <Text style={[styles.goldenOffTitle, { color: theme.primary }]}>회식 & 모임 추천일 (Golden Off)</Text>
              <Text style={styles.goldenOffDesc}>
                <Text style={{ color: theme.primary, fontWeight: '800' }}>9월 14일(일)</Text>과 <Text style={{ color: theme.primary, fontWeight: '800' }}>9월 20일(토)</Text>에 전원 또는 과반수가 쉬는 날입니다!
              </Text>
            </View>

            <View style={styles.matrixHeaderRow}>
              <Text style={styles.sectionHeading}>구성원 31일 듀티 매트릭스</Text>
              <Text style={styles.scrollHint}>좌우로 스크롤하여 날짜별 확인</Text>
            </View>

            {/* 스케줄 테이블 매트릭스 (마이듀티 레퍼런스 스타일: 넉넉한 셀과 볼드 뱃지) */}
            <View style={styles.tableCard}>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View>
                  {/* 날짜 + 요일 2단 헤더 행 */}
                  <View style={styles.tableRow}>
                    <View style={styles.memberColHeader}>
                      <Text style={styles.colHeaderText}>구성원</Text>
                    </View>
                    {days.map((d) => {
                      const dateObj = new Date(currentYear, currentMonth, d);
                      const dayOfWeekIdx = dateObj.getDay();
                      const dayOfWeek = ['일', '월', '화', '수', '목', '금', '토'][dayOfWeekIdx];
                      const isSun = dayOfWeekIdx === 0;
                      const isSat = dayOfWeekIdx === 6;
                      return (
                        <View key={`day_${d}`} style={styles.dayColHeader}>
                          <Text style={[styles.dayHeaderText, isSun && styles.sundayText, isSat && styles.saturdayText]}>
                            {d}
                          </Text>
                          <Text style={[styles.dayWeekText, isSun && styles.sundayText, isSat && styles.saturdayText]}>
                            {dayOfWeek}
                          </Text>
                        </View>
                      );
                    })}
                  </View>

                  {/* 각 멤버별 스케줄 행 */}
                  {groupChat.members.map((member) => (
                    <View key={member.id} style={styles.tableRow}>
                      <View style={styles.memberCol}>
                        <View style={[styles.miniAvatar, { backgroundColor: member.avatarBg }]}>
                          <Text style={styles.miniAvatarText}>{member.avatarLetter}</Text>
                        </View>
                        <Text style={styles.memberNameText} numberOfLines={1}>
                          {member.name}
                        </Text>
                      </View>

                      {member.monthlyShifts.map((s) => {
                        const shiftColor = SHIFT_TYPES[s.shift]?.color || COLORS.textMuted;
                        return (
                          <View
                            key={`shift_${member.id}_${s.day}`}
                            style={styles.shiftCell}
                          >
                            <View style={[styles.shiftBadge, { backgroundColor: shiftColor }]}>
                              <Text style={styles.shiftBadgeText}>
                                {s.shift === 'O' ? 'OFF' : s.shift}
                              </Text>
                            </View>
                          </View>
                        );
                      })}
                    </View>
                  ))}
                </View>
              </ScrollView>
            </View>

            {/* 범례 */}
            <View style={styles.legendRow}>
              <View style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: COLORS.shift.day }]} />
                <Text style={styles.legendText}>Day</Text>
              </View>
              <View style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: COLORS.shift.evening }]} />
                <Text style={styles.legendText}>Evening</Text>
              </View>
              <View style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: COLORS.shift.night }]} />
                <Text style={styles.legendText}>Night</Text>
              </View>
              <View style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: COLORS.shift.off }]} />
                <Text style={styles.legendText}>Off</Text>
              </View>
            </View>

            {/* ══════════ 듀티 매트릭스 아래: 공통 스케줄 목록 (모듈 분리) ══════════ */}
            <CommonScheduleList
              commonSchedules={commonSchedules}
              filteredCommonSchedules={filteredCommonSchedules}
              filter={commonScheduleFilter}
              onFilterChange={setCommonScheduleFilter}
              onShareSchedule={handleShareCommonSchedule}
            />
          </ScrollView>
        )}

        {/* ══════════ TAB 2: 단체 대화방 ══════════ */}
        {activeTab === 'chat' && (
          <View style={styles.chatContainer}>
            <ScrollView style={styles.chatScroll} contentContainerStyle={styles.chatContent}>
              {messages.map((m) => (
                <View
                  key={m.id}
                  style={[styles.msgRow, m.isMe ? styles.msgRowMe : styles.msgRowOther]}
                >
                  <View style={{ maxWidth: '78%' }}>
                    {!m.isMe && <Text style={styles.senderName}>{m.sender}</Text>}
                    <View
                      style={[
                        styles.bubble,
                        m.isMe ? [styles.bubbleMe, { backgroundColor: theme.primary }] : styles.bubbleOther,
                      ]}
                    >
                      <Text
                        style={[
                          styles.bubbleText,
                          m.isMe ? [styles.bubbleTextMe, { color: theme.onPrimaryText }] : styles.bubbleTextOther,
                        ]}
                      >
                        {m.text}
                      </Text>
                    </View>
                    <Text style={[styles.msgTime, m.isMe ? { textAlign: 'right' } : { textAlign: 'left' }]}>
                      {m.time}
                    </Text>
                  </View>
                </View>
              ))}
            </ScrollView>

            <View style={styles.inputBar}>
              <TextInput
                style={styles.textInput}
                value={messageText}
                onChangeText={setMessageText}
                placeholder="단체방에 메시지 입력..."
                placeholderTextColor={COLORS.textMuted}
              />
              <TouchableOpacity
                style={[
                  styles.sendBtn,
                  messageText.trim() ? { backgroundColor: theme.primary } : styles.sendBtnDisabled,
                ]}
                onPress={handleSendMessage}
                disabled={!messageText.trim()}
              >
                <SendIcon size={18} color={messageText.trim() ? theme.onPrimaryText : COLORS.textMuted} />
              </TouchableOpacity>
            </View>
          </View>
        )}
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.cardBackground,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 54,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.divider,
    backgroundColor: COLORS.cardBackground,
  },
  backBtnText: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.primary,
  },
  headerCenter: {
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  headerSub: {
    fontSize: 11,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  tabRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: COLORS.offWhite,
    gap: 8,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.divider,
  },
  tabBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: COLORS.cardBackground,
    gap: 6,
    borderWidth: 1,
    borderColor: COLORS.border,
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
    color: COLORS.background,
  },
  matrixScroll: {
    flex: 1,
    backgroundColor: COLORS.cardBackground,
  },
  matrixContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 40,
  },
  goldenOffCard: {
    backgroundColor: TINT_COLORS.pinkTint,
    borderRadius: 16,
    padding: 14,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.primary,
    marginBottom: 20,
  },
  goldenOffTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: COLORS.primary,
    marginBottom: 4,
  },
  goldenOffDesc: {
    fontSize: 12,
    color: COLORS.textPrimary,
    lineHeight: 18,
  },
  boldPink: {
    color: COLORS.primary,
    fontWeight: '800',
  },
  matrixHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  sectionHeading: {
    fontSize: 15,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  scrollHint: {
    fontSize: 11,
    color: COLORS.textMuted,
  },
  tableCard: {
    backgroundColor: COLORS.cardBackground,
    borderRadius: 16,
    padding: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
    marginBottom: 16,
  },
  tableRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.divider,
    paddingVertical: 6,
  },
  memberColHeader: {
    width: 78,
    paddingLeft: 4,
  },
  colHeaderText: {
    fontSize: 12,
    fontWeight: '800',
    color: COLORS.textSecondary,
  },
  dayColHeader: {
    width: 44,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    borderLeftWidth: 0.5,
    borderLeftColor: COLORS.divider,
  },
  dayHeaderText: {
    fontSize: 12,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  dayWeekText: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.textMuted,
    marginTop: 1,
  },
  sundayText: {
    color: COLORS.status.error,
  },
  saturdayText: {
    color: COLORS.status.info,
  },
  memberCol: {
    width: 78,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingLeft: 2,
  },
  miniAvatar: {
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },
  miniAvatarText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  memberNameText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.textPrimary,
    flex: 1,
  },
  shiftCell: {
    width: 44,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    borderLeftWidth: 0.5,
    borderLeftColor: COLORS.divider,
  },
  offCellHighlight: {
    backgroundColor: TINT_COLORS.pinkTint,
  },
  shiftBadge: {
    width: 36,
    height: 36,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 1.5,
    elevation: 1,
  },
  shiftBadgeText: {
    fontSize: 13,
    fontWeight: '900',
    color: COLORS.background,
  },
  legendRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 14,
    marginTop: 6,
    marginBottom: 8,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  legendText: {
    fontSize: 11,
    color: COLORS.textMuted,
    fontWeight: '600',
  },
  chatContainer: {
    flex: 1,
    backgroundColor: COLORS.offWhite,
  },
  chatScroll: {
    flex: 1,
  },
  chatContent: {
    padding: 16,
    gap: 12,
  },
  msgRow: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  msgRowMe: {
    justifyContent: 'flex-end',
  },
  msgRowOther: {
    justifyContent: 'flex-start',
  },
  senderName: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.textSecondary,
    marginBottom: 2,
  },
  bubble: {
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  bubbleMe: {
    backgroundColor: COLORS.primary,
    borderBottomRightRadius: 4,
  },
  bubbleOther: {
    backgroundColor: COLORS.cardBackground,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderBottomLeftRadius: 4,
  },
  bubbleText: {
    fontSize: 13,
    lineHeight: 18,
  },
  bubbleTextMe: {
    color: COLORS.background,
  },
  bubbleTextOther: {
    color: COLORS.textPrimary,
  },
  msgTime: {
    fontSize: 10,
    color: COLORS.textMuted,
    marginTop: 3,
    paddingHorizontal: 4,
  },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    backgroundColor: COLORS.cardBackground,
    gap: 10,
  },
  textInput: {
    flex: 1,
    backgroundColor: COLORS.divider,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 14,
    color: COLORS.textPrimary,
  },
  sendBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendBtnDisabled: {
    backgroundColor: COLORS.border,
  },
});

export default GroupChatDetailModal;

