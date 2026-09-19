import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { COLORS } from '../../../constants/theme';
import { SHIFT_TYPES } from '../../../constants/shiftTypes';
import { FriendDetail, ChatMessage } from '../../../mocks/friendsData';
import { useFriendsStore } from '../../../store/useFriendsStore';
import { useUserStore } from '../../../store/useUserStore';
import { SendIcon, RepeatIcon } from '../../common/Icon';
import { useKeyboardOffset } from '../../../hooks/useKeyboardOffset';

interface ChatRoomModalProps {
  visible: boolean;
  friend: FriendDetail | null;
  onClose: () => void;
}

export const ChatRoomModal: React.FC<ChatRoomModalProps> = ({
  visible,
  friend,
  onClose,
}) => {
  const keyboardOffset = useKeyboardOffset(Platform.OS === 'ios' ? 10 : 0);
  const myUserId = useUserStore((s) => s.id);
  const { chatMessages, fetchChatMessages, sendMessage, respondToSwap } = useFriendsStore();
  const [inputText, setInputText] = useState('');

  React.useEffect(() => {
    if (visible && friend && myUserId) {
      fetchChatMessages(myUserId, friend.id);
    }
  }, [visible, friend, myUserId, fetchChatMessages]);

  if (!friend) return null;

  const messages: ChatMessage[] = chatMessages[friend.id] || [
    {
      id: 'init_1',
      senderId: friend.id,
      text: `${friend.name}님과의 대화방입니다. 듀티 공유와 인수인계를 자유롭게 나눠보세요!`,
      timestamp: '오전 09:00',
    },
  ];

  const shiftInfo = SHIFT_TYPES[friend.todayShift];

  const handleSend = () => {
    if (!inputText.trim()) return;
    sendMessage(friend.id, inputText.trim(), false, undefined, myUserId || undefined);
    setInputText('');
  };

  const handleQuickCheer = (cheerText: string) => {
    sendMessage(friend.id, cheerText, false, undefined, myUserId || undefined);
  };

  const handleQuickSwap = () => {
    sendMessage(
      friend.id,
      `선생님, 혹시 다음 주 9월 12일(금) 제 Day 근무와 선생님 Evening 맞교환 가능할까요?`,
      true,
      {
        myShift: '9/12(금) Day',
        targetShift: '9/12(금) Evening',
        status: 'pending',
      },
      myUserId || undefined
    );
    Alert.alert('교환 제안 전송', `${friend.name}님께 듀티 맞교환 제안을 보냈습니다.`);
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={false} onRequestClose={onClose}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={keyboardOffset}
        style={styles.container}
      >
        {/* 헤더 */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
            <Text style={styles.backBtnText}>‹ 뒤로</Text>
          </TouchableOpacity>

          <View style={styles.headerCenter}>
            <View style={styles.headerTitleRow}>
              <Text style={styles.headerTitle}>{friend.name}</Text>
              <View style={[styles.dutyBadge, { backgroundColor: shiftInfo.color }]}>
                <Text style={styles.dutyBadgeText}>{shiftInfo.shortName} ({shiftInfo.code})</Text>
              </View>
            </View>
            <Text style={styles.headerSub}>{friend.hospital} • {friend.ward}</Text>
          </View>

          <View style={{ width: 40 }} />
        </View>

        {/* 퀵 액션 칩 바 */}
        <View style={styles.quickBar}>
          <TouchableOpacity
            style={styles.quickChip}
            onPress={() => handleQuickCheer('선생님 오늘 근무 고생 많으셨어요! 커피 쏠게요 ☕')}
          >
            <Text style={styles.quickChipText}>☕ 커피 쏠게</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.quickChip} onPress={handleQuickSwap}>
            <RepeatIcon size={14} color={COLORS.primary} />
            <Text style={styles.quickChipText}>듀티 맞교환 제안</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.quickChip}
            onPress={() => handleQuickCheer('오늘 502호 수액 속도 조절 노티 완료했습니다!')}
          >
            <Text style={styles.quickChipText}>인수인계 메모</Text>
          </TouchableOpacity>
        </View>

        {/* 메시지 리스트 */}
        <ScrollView
          style={styles.chatScroll}
          contentContainerStyle={styles.chatContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {messages.map((msg) => {
            const isMe = msg.senderId === 'me';
            return (
              <View
                key={msg.id}
                style={[styles.msgRow, isMe ? styles.msgRowMe : styles.msgRowOther]}
              >
                {!isMe && (
                  <View style={[styles.miniAvatar, { backgroundColor: friend.avatarBg }]}>
                    <Text style={styles.miniAvatarText}>{friend.avatarLetter}</Text>
                  </View>
                )}

                <View style={{ maxWidth: '78%' }}>
                  <View
                    style={[
                      styles.bubble,
                      isMe ? styles.bubbleMe : styles.bubbleOther,
                    ]}
                  >
                    <Text
                      style={[
                        styles.bubbleText,
                        isMe ? styles.bubbleTextMe : styles.bubbleTextOther,
                      ]}
                    >
                      {msg.text}
                    </Text>

                    {/* 듀티 맞교환 제안 카드 */}
                    {msg.isSwapRequest && msg.swapDetails && (
                      <View style={styles.swapCard}>
                        <Text style={styles.swapCardTitle}>🗓️ 듀티 맞교환 요청서</Text>
                        <View style={styles.swapDetailRow}>
                          <Text style={styles.swapDetailLabel}>내 근무:</Text>
                          <Text style={styles.swapDetailVal}>{msg.swapDetails.myShift}</Text>
                        </View>
                        <View style={styles.swapDetailRow}>
                          <Text style={styles.swapDetailLabel}>상대 근무:</Text>
                          <Text style={styles.swapDetailVal}>{msg.swapDetails.targetShift}</Text>
                        </View>

                        <View style={styles.swapBtnRow}>
                          {msg.swapDetails.status === 'pending' ? (
                            <>
                              <TouchableOpacity
                                style={styles.swapDeclineBtn}
                                onPress={() => respondToSwap(friend.id, msg.id, false)}
                              >
                                <Text style={styles.swapDeclineText}>거절</Text>
                              </TouchableOpacity>
                              <TouchableOpacity
                                style={styles.swapAcceptBtn}
                                onPress={() => {
                                  respondToSwap(friend.id, msg.id, true);
                                  Alert.alert('교환 완료', '듀티 맞교환이 수락되어 스케줄에 반영되었습니다!');
                                }}
                              >
                                <Text style={styles.swapAcceptText}>수락하기</Text>
                              </TouchableOpacity>
                            </>
                          ) : (
                            <View style={styles.statusResultBox}>
                              <Text style={styles.statusResultText}>
                                {msg.swapDetails.status === 'accepted' ? '✓ 교환 수락 완료' : '✕ 교환 거절됨'}
                              </Text>
                            </View>
                          )}
                        </View>
                      </View>
                    )}
                  </View>

                  <Text
                    style={[
                      styles.timestampText,
                      isMe ? { textAlign: 'right' } : { textAlign: 'left' },
                    ]}
                  >
                    {msg.timestamp}
                  </Text>
                </View>
              </View>
            );
          })}
        </ScrollView>

        {/* 하단 인풋 바 */}
        <View style={styles.inputBar}>
          <TextInput
            style={styles.textInput}
            value={inputText}
            onChangeText={setInputText}
            placeholder="메시지를 입력하세요..."
            placeholderTextColor={COLORS.textMuted}
            multiline={false}
            returnKeyType="send"
            onSubmitEditing={handleSend}
          />
          <TouchableOpacity
            style={[styles.sendBtn, !inputText.trim() && styles.sendBtnDisabled]}
            onPress={handleSend}
            disabled={!inputText.trim()}
            activeOpacity={0.8}
          >
            <SendIcon size={18} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
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
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  dutyBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  dutyBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  headerSub: {
    fontSize: 11,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  quickBar: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#F9FAFB',
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  quickChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  quickChipText: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  chatScroll: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  chatContent: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    gap: 12,
  },
  msgRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 4,
  },
  msgRowMe: {
    justifyContent: 'flex-end',
  },
  msgRowOther: {
    justifyContent: 'flex-start',
  },
  miniAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  miniAvatarText: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textPrimary,
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
  timestampText: {
    fontSize: 10,
    color: COLORS.textMuted,
    marginTop: 4,
    paddingHorizontal: 4,
  },
  swapCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 12,
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  swapCardTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: COLORS.textPrimary,
    marginBottom: 6,
  },
  swapDetailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 3,
  },
  swapDetailLabel: {
    fontSize: 11,
    color: COLORS.textSecondary,
  },
  swapDetailVal: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.primary,
  },
  swapBtnRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 10,
  },
  swapDeclineBtn: {
    flex: 1,
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    paddingVertical: 8,
    alignItems: 'center',
  },
  swapDeclineText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.textSecondary,
  },
  swapAcceptBtn: {
    flex: 1.5,
    backgroundColor: COLORS.primary,
    borderRadius: 8,
    paddingVertical: 8,
    alignItems: 'center',
  },
  swapAcceptText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  statusResultBox: {
    flex: 1,
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    paddingVertical: 6,
    alignItems: 'center',
  },
  statusResultText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.primary,
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

export default ChatRoomModal;
