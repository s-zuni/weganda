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
import { COLORS } from '../../../constants/theme';
import { SHIFT_TYPES } from '../../../constants/shiftTypes';
import { GroupChat } from '../../../mocks/friendsData';
import { CalendarIcon, SendIcon, UsersIcon } from '../../common/Icon';

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
  const [activeTab, setActiveTab] = useState<TabMode>('matrix');
  const [messageText, setMessageText] = useState('');
  const [messages, setMessages] = useState<
    { id: string; sender: string; text: string; time: string; isMe?: boolean }[]
  >([
    { id: '1', sender: '김민지', text: '선생님들 이번 주 회식 날짜 언제가 좋을까요?', time: '오후 1:10' },
    { id: '2', sender: '한준혁', text: '저는 이번 주말 다 좋습니다!', time: '오후 1:12' },
    { id: '3', sender: '송지원', text: '스케줄 매트릭스 보니까 14일이랑 20일이 다 오프네요!', time: '오후 1:15' },
  ]);

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
            <Text style={styles.backBtnText}>‹ 뒤로</Text>
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
            style={[styles.tabBtn, activeTab === 'matrix' && styles.tabBtnActive]}
            onPress={() => setActiveTab('matrix')}
          >
            <CalendarIcon size={16} color={activeTab === 'matrix' ? '#FFFFFF' : COLORS.textSecondary} />
            <Text style={[styles.tabText, activeTab === 'matrix' && styles.tabTextActive]}>
              구성원 스케줄 일괄 비교
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tabBtn, activeTab === 'chat' && styles.tabBtnActive]}
            onPress={() => setActiveTab('chat')}
          >
            <UsersIcon size={16} color={activeTab === 'chat' ? '#FFFFFF' : COLORS.textSecondary} />
            <Text style={[styles.tabText, activeTab === 'chat' && styles.tabTextActive]}>
              단체 대화방
            </Text>
          </TouchableOpacity>
        </View>

        {/* ══════════ TAB 1: 전원 스케줄 일괄 비교 매트릭스 ══════════ */}
        {activeTab === 'matrix' && (
          <ScrollView style={styles.matrixScroll} contentContainerStyle={styles.matrixContent}>
            {/* 골든 오프(전원 휴무일) 추천 배너 */}
            <View style={styles.goldenOffCard}>
              <Text style={styles.goldenOffTitle}>회식 & 모임 추천일 (Golden Off)</Text>
              <Text style={styles.goldenOffDesc}>
                <Text style={styles.boldPink}>9월 14일(일)</Text>과 <Text style={styles.boldPink}>9월 20일(토)</Text>에 전원 또는 과반수가 쉬는 날입니다!
              </Text>
            </View>

            <View style={styles.matrixHeaderRow}>
              <Text style={styles.sectionHeading}>구성원 31일 듀티 매트릭스</Text>
              <Text style={styles.scrollHint}>좌우로 스크롤하여 날짜별 확인</Text>
            </View>

            {/* 스케줄 테이블 매트릭스 */}
            <View style={styles.tableCard}>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View>
                  {/* 날짜 헤더 행 */}
                  <View style={styles.tableRow}>
                    <View style={styles.memberColHeader}>
                      <Text style={styles.colHeaderText}>구성원</Text>
                    </View>
                    {days.map((d) => (
                      <View key={`day_${d}`} style={styles.dayColHeader}>
                        <Text style={styles.dayHeaderText}>{d}</Text>
                      </View>
                    ))}
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
                        const shiftColor = SHIFT_TYPES[s.shift]?.color || '#9CA3AF';
                        const isOff = s.shift === 'O';
                        return (
                          <View
                            key={`shift_${member.id}_${s.day}`}
                            style={[styles.shiftCell, isOff && styles.offCellHighlight]}
                          >
                            <View style={[styles.shiftBadge, { backgroundColor: shiftColor }]}>
                              <Text style={styles.shiftBadgeText}>{s.shift}</Text>
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
                <View style={[styles.legendDot, { backgroundColor: '#4F98CA' }]} />
                <Text style={styles.legendText}>Day</Text>
              </View>
              <View style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: '#E2703A' }]} />
                <Text style={styles.legendText}>Evening</Text>
              </View>
              <View style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: '#272727' }]} />
                <Text style={styles.legendText}>Night</Text>
              </View>
              <View style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: '#E84A5F' }]} />
                <Text style={styles.legendText}>Off</Text>
              </View>
            </View>
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
                    <View style={[styles.bubble, m.isMe ? styles.bubbleMe : styles.bubbleOther]}>
                      <Text style={[styles.bubbleText, m.isMe ? styles.bubbleTextMe : styles.bubbleTextOther]}>
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
                style={[styles.sendBtn, !messageText.trim() && styles.sendBtnDisabled]}
                onPress={handleSendMessage}
                disabled={!messageText.trim()}
              >
                <SendIcon size={18} color="#FFFFFF" />
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
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 54,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
    backgroundColor: '#FFFFFF',
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
    backgroundColor: '#F9FAFB',
    gap: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  tabBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    gap: 6,
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
  matrixScroll: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  matrixContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 40,
  },
  goldenOffCard: {
    backgroundColor: '#FFF1F4',
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
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 10,
    borderWidth: 1,
    borderColor: '#E5E7EB',
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
    borderBottomColor: '#F3F4F6',
    paddingVertical: 6,
  },
  memberColHeader: {
    width: 90,
    paddingLeft: 4,
  },
  colHeaderText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.textSecondary,
  },
  dayColHeader: {
    width: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayHeaderText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.textMuted,
  },
  memberCol: {
    width: 90,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  miniAvatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
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
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 4,
  },
  offCellHighlight: {
    backgroundColor: '#FFF1F4',
  },
  shiftBadge: {
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  shiftBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  legendRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 14,
    marginTop: 4,
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
    backgroundColor: '#F8F9FA',
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
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderBottomLeftRadius: 4,
  },
  bubbleText: {
    fontSize: 13,
    lineHeight: 18,
  },
  bubbleTextMe: {
    color: '#FFFFFF',
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
    borderTopColor: '#E5E7EB',
    backgroundColor: '#FFFFFF',
    gap: 10,
  },
  textInput: {
    flex: 1,
    backgroundColor: '#F3F4F6',
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
    backgroundColor: '#E5E7EB',
  },
});

export default GroupChatDetailModal;

