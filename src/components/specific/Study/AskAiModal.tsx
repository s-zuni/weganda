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
import { COLORS, useAppTheme } from '../../../constants/theme';
import { useStudyStore } from '../../../store/useStudyStore';
import { useUserStore } from '../../../store/useUserStore';
import { FREE_LIMITS } from '../../../constants/membership';
import { PaywallBottomSheet } from '../../common/PaywallBottomSheet';
import { MembershipScreen } from '../../../screens/MyPage/MembershipScreen';
import { BotIcon, SendIcon } from '../../common/Icon';
import { useKeyboardOffset } from '../../../hooks/useKeyboardOffset';

interface AskAiModalProps {
  visible: boolean;
  onClose: () => void;
  initialQuestion?: string;
}

const QUICK_QUESTIONS = [
  '도파민 gtt 점적 계산 공식 알려줘',
  'K-ACLS 심폐소생술 약물 타이밍',
  '수혈 간호 핵심 3원칙',
  'SBAR 인수인계 작성 요령',
];

export const AskAiModal: React.FC<AskAiModalProps> = ({
  visible,
  onClose,
  initialQuestion,
}) => {
  const theme = useAppTheme();
  const keyboardOffset = useKeyboardOffset(Platform.OS === 'ios' ? 10 : 0);
  const { aiMessages, askAi } = useStudyStore();
  const { isPremium, dailyAiCount, incrementDailyAiCount } = useUserStore();
  const [inputText, setInputText] = useState('');
  const [paywallVisible, setPaywallVisible] = useState(false);
  const [membershipVisible, setMembershipVisible] = useState(false);

  // 검색창에서 전달된 질문이 있을 경우 자동 질문 전송
  React.useEffect(() => {
    if (visible && initialQuestion && initialQuestion.trim()) {
      if (!isPremium && dailyAiCount >= FREE_LIMITS.maxDailyAiQueries) {
        setPaywallVisible(true);
        return;
      }
      askAi(initialQuestion.trim());
      if (!isPremium) {
        incrementDailyAiCount();
      }
    }
  }, [visible, initialQuestion]);

  const handleSend = (textToSend?: string) => {
    const text = textToSend || inputText;
    if (!text.trim()) return;

    if (!isPremium && dailyAiCount >= FREE_LIMITS.maxDailyAiQueries) {
      setPaywallVisible(true);
      return;
    }

    askAi(text.trim());
    if (!isPremium) {
      incrementDailyAiCount();
    }
    setInputText('');
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
            <Text style={[styles.backText, { color: theme.primary }]}>‹ 닫기</Text>
          </TouchableOpacity>

          <View style={styles.headerTitleRow}>
            <BotIcon size={18} color={theme.primary} />
            <Text style={styles.headerTitle}>임상 간호 AI 멘토</Text>
            {!isPremium && (
              <View style={[styles.limitBadge, { backgroundColor: theme.primary + '18' }]}>
                <Text style={[styles.limitBadgeText, { color: theme.primary }]}>{dailyAiCount}/3회</Text>
              </View>
            )}
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
          keyboardShouldPersistTaps="handled"
        >
          {aiMessages.map((msg) => {
            const isMe = msg.sender === 'user';
            return (
              <View
                key={msg.id}
                style={[styles.msgRow, isMe ? styles.msgRowMe : styles.msgRowAi]}
              >
                {!isMe && (
                  <View style={[styles.aiAvatar, { backgroundColor: theme.primary + '18' }]}>
                    <BotIcon size={16} color={theme.primary} />
                  </View>
                )}

                <View style={{ maxWidth: '82%' }}>
                  <View
                    style={[
                      styles.bubble,
                      isMe
                        ? [styles.bubbleMe, { backgroundColor: theme.primary }]
                        : styles.bubbleAi,
                    ]}
                  >
                    <Text
                      style={[
                        styles.bubbleText,
                        isMe
                          ? [styles.bubbleTextMe, { color: theme.onPrimaryText }]
                          : styles.bubbleTextAi,
                      ]}
                    >
                      {msg.text}
                    </Text>

                    {/* 공식 임상 지침 출처 (Grounding Badge) */}
                    {!isMe && msg.sources && msg.sources.length > 0 && (
                      <View style={styles.sourcesContainer}>
                        <View style={styles.sourceHeaderRow}>
                          <Text style={styles.sourceHeaderText}>근거 문헌</Text>
                        </View>
                        {msg.sources.map((src, sIdx) => (
                          <View key={sIdx} style={styles.sourceBadge}>
                            <View style={styles.agencyPill}>
                              <Text style={styles.agencyPillText}>{src.sourceAgency}</Text>
                            </View>
                            <Text style={styles.sourceBadgeTitle} numberOfLines={1} ellipsizeMode="tail">
                              {src.title}
                            </Text>
                          </View>
                        ))}
                      </View>
                    )}
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
            returnKeyType="send"
            onSubmitEditing={() => handleSend()}
          />
          <TouchableOpacity
            style={[
              styles.sendBtn,
              inputText.trim() ? { backgroundColor: theme.primary } : styles.sendBtnDisabled,
            ]}
            onPress={() => handleSend()}
            disabled={!inputText.trim()}
            activeOpacity={0.85}
          >
            <SendIcon size={16} color={inputText.trim() ? theme.onPrimaryText : COLORS.textMuted} />
          </TouchableOpacity>
        </View>

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
          featureTitle="Ask AI 무제한 질문"
          featureDescription="무료 일일 3회 초과 시 weganda+로 무제한 임상 멘토링을 이용하세요"
        />

        <MembershipScreen
          visible={membershipVisible}
          onClose={() => setMembershipVisible(false)}
        />
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
    backgroundColor: '#FFFFFF',
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
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  bubble: {
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  bubbleMe: {
    borderBottomRightRadius: 4,
  },
  bubbleAi: {
    backgroundColor: '#F2F4F6',
    borderBottomLeftRadius: 4,
  },
  bubbleText: {
    fontSize: 14,
    lineHeight: 21,
  },
  bubbleTextMe: {
    color: '#FFFFFF',
  },
  bubbleTextAi: {
    color: COLORS.textPrimary,
  },
  timeText: {
    fontSize: 11,
    color: COLORS.textMuted,
    marginTop: 4,
    paddingHorizontal: 4,
  },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    backgroundColor: '#FFFFFF',
    gap: 10,
  },
  textInput: {
    flex: 1,
    backgroundColor: '#F2F4F6',
    borderRadius: 22,
    paddingHorizontal: 16,
    paddingVertical: 9,
    fontSize: 14,
    color: COLORS.textPrimary,
  },
  sendBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendBtnDisabled: {
    backgroundColor: '#E5E7EB',
  },
  limitBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    marginLeft: 6,
  },
  limitBadgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  sourcesContainer: {
    marginTop: 10,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    gap: 6,
  },
  sourceHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  sourceHeaderText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.textMuted,
    letterSpacing: -0.2,
  },
  sourceBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    gap: 6,
  },
  agencyPill: {
    backgroundColor: '#F3F4F6',
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  agencyPillText: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.textSecondary,
    lineHeight: 14,
  },
  sourceBadgeTitle: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.textPrimary,
    lineHeight: 16,
    flex: 1,
  },
});

export default AskAiModal;

