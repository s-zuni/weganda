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
} from 'react-native';
import { COLORS } from '../../../constants/theme';
import { useStudyStore } from '../../../store/useStudyStore';
import { BotIcon, SendIcon } from '../../common/Icon';

interface AskAiModalProps {
  visible: boolean;
  onClose: () => void;
}

const QUICK_QUESTIONS = [
  '도파민 gtt 점적 계산 공식 알려줘',
  'K-ACLS 심폐소생술 약물 타이밍',
  '수혈 간호 핵심 3원칙',
  'SBAR 인수인계 작성 요령',
];

export const AskAiModal: React.FC<AskAiModalProps> = ({ visible, onClose }) => {
  const { aiMessages, askAi } = useStudyStore();
  const [inputText, setInputText] = useState('');

  const handleSend = (textToSend?: string) => {
    const text = textToSend || inputText;
    if (!text.trim()) return;
    askAi(text.trim());
    setInputText('');
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={false} onRequestClose={onClose}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        {/* 헤더 */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
            <Text style={styles.backText}>‹ 닫기</Text>
          </TouchableOpacity>

          <View style={styles.headerTitleRow}>
            <BotIcon size={18} color={COLORS.primary} />
            <Text style={styles.headerTitle}>임상 간호 AI 멘토</Text>
          </View>

          <View style={{ width: 40 }} />
        </View>

        {/* 퀵 질문 칩 바 */}
        <View style={styles.quickBar}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {QUICK_QUESTIONS.map((q, idx) => (
              <TouchableOpacity
                key={idx}
                style={styles.quickChip}
                onPress={() => handleSend(q)}
                activeOpacity={0.8}
              >
                <Text style={styles.quickChipText}>{q}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* 메시지 스트림 */}
        <ScrollView
          style={styles.chatScroll}
          contentContainerStyle={styles.chatContent}
          showsVerticalScrollIndicator={false}
        >
          {aiMessages.map((msg) => {
            const isMe = msg.sender === 'user';
            return (
              <View
                key={msg.id}
                style={[styles.msgRow, isMe ? styles.msgRowMe : styles.msgRowAi]}
              >
                {!isMe && (
                  <View style={styles.aiAvatar}>
                    <BotIcon size={16} color={COLORS.primary} />
                  </View>
                )}

                <View style={{ maxWidth: '82%' }}>
                  <View style={[styles.bubble, isMe ? styles.bubbleMe : styles.bubbleAi]}>
                    <Text style={[styles.bubbleText, isMe ? styles.bubbleTextMe : styles.bubbleTextAi]}>
                      {msg.text}
                    </Text>
                  </View>
                  <Text style={[styles.timeText, isMe ? { textAlign: 'right' } : { textAlign: 'left' }]}>
                    {msg.time}
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
            placeholder="임상 프로토콜, 약물 투약법을 질문하세요..."
            placeholderTextColor={COLORS.textMuted}
          />
          <TouchableOpacity
            style={[styles.sendBtn, !inputText.trim() && styles.sendBtnDisabled]}
            onPress={() => handleSend()}
            disabled={!inputText.trim()}
            activeOpacity={0.85}
          >
            <SendIcon size={16} color="#FFFFFF" />
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
  },
  backText: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.primary,
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  quickBar: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#F9FAFB',
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  quickChip: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
    marginRight: 8,
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
    padding: 16,
    gap: 14,
  },
  msgRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 4,
  },
  msgRowMe: {
    justifyContent: 'flex-end',
  },
  msgRowAi: {
    justifyContent: 'flex-start',
  },
  aiAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FFF1F4',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
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
  bubbleAi: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderBottomLeftRadius: 4,
  },
  bubbleText: {
    fontSize: 13,
    lineHeight: 20,
  },
  bubbleTextMe: {
    color: '#FFFFFF',
  },
  bubbleTextAi: {
    color: COLORS.textPrimary,
  },
  timeText: {
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
    fontSize: 13,
    color: COLORS.textPrimary,
  },
  sendBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendBtnDisabled: {
    backgroundColor: '#E5E7EB',
  },
});

export default AskAiModal;

