import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS } from '../../../constants/theme';
import { useUserStore } from '../../../store/useUserStore';
import { useFortuneChatStore } from '../../../store/useFortuneChatStore';
import { FREE_LIMITS } from '../../../constants/membership';
import { PaywallBottomSheet } from '../../common/PaywallBottomSheet';
import { MembershipScreen } from '../../../screens/MyPage/MembershipScreen';
import { SparklesIcon, SendIcon } from '../../common/Icon';
import { useKeyboardOffset } from '../../../hooks/useKeyboardOffset';
import { SwipeDismissModal } from '../../common/SwipeDismissModal';
import { SajuAnalysisResult } from '../../../services/manseryeokService';
import { SajuTopicItem } from '../../../mocks/sajuCategories';

interface SajuChatModalProps {
  visible: boolean;
  onClose: () => void;
  topic: SajuTopicItem;
  userSaju: SajuAnalysisResult;
  mbti?: string;
  reportContext?: { coreKeyword?: string; summaryQuote?: string };
}

const QUICK_QUESTIONS = [
  '지금 제일 조심해야 할 부분이 뭔가요?',
  '제 MBTI랑 사주가 어떻게 서로 영향을 주나요?',
  '앞으로 3개월 안에 대비할 건 뭔가요?',
];

export const SajuChatModal: React.FC<SajuChatModalProps> = ({
  visible,
  onClose,
  topic,
  userSaju,
  mbti,
  reportContext,
}) => {
  const keyboardOffset = useKeyboardOffset(Platform.OS === 'ios' ? 10 : 0);
  const insets = useSafeAreaInsets();
  const { messages, isThinking, startChatForTopic, askAboutTopic } = useFortuneChatStore();
  const { isPremium, dailyFortuneChatCount, incrementDailyFortuneChatCount } = useUserStore();
  const [inputText, setInputText] = useState('');
  const [paywallVisible, setPaywallVisible] = useState(false);
  const [membershipVisible, setMembershipVisible] = useState(false);

  useEffect(() => {
    if (visible) {
      startChatForTopic(topic);
    }
  }, [visible, topic.id]);

  const handleSend = (textToSend?: string) => {
    const text = textToSend || inputText;
    if (!text.trim() || isThinking) return;

    if (!isPremium && dailyFortuneChatCount >= FREE_LIMITS.maxDailyFortuneChatQueries) {
      setPaywallVisible(true);
      return;
    }

    askAboutTopic({ question: text.trim(), topic, userSaju, mbti, reportContext });
    if (!isPremium) {
      incrementDailyFortuneChatCount();
    }
    setInputText('');
  };

  return (
    <SwipeDismissModal visible={visible} onClose={onClose}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={keyboardOffset}
        style={styles.container}
      >
        <View style={[styles.header, { paddingTop: Math.max(insets.top, 20) + 14 }]}>
          <TouchableOpacity onPress={onClose} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
            <Text style={styles.backText}>‹ 닫기</Text>
          </TouchableOpacity>

          <View style={styles.headerTitleRow}>
            <SparklesIcon size={18} color={COLORS.primary} />
            <Text style={styles.headerTitle} numberOfLines={1}>{topic.title}</Text>
            {!isPremium && (
              <View style={styles.limitBadge}>
                <Text style={styles.limitBadgeText}>
                  {dailyFortuneChatCount}/{FREE_LIMITS.maxDailyFortuneChatQueries}회
                </Text>
              </View>
            )}
          </View>

          <View style={{ width: 40 }} />
        </View>

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

        <ScrollView
          style={styles.chatScroll}
          contentContainerStyle={styles.chatContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {messages.map((msg) => {
            const isMe = msg.sender === 'user';
            return (
              <View key={msg.id} style={[styles.msgRow, isMe ? styles.msgRowMe : styles.msgRowAi]}>
                {!isMe && (
                  <View style={styles.aiAvatar}>
                    <SparklesIcon size={16} color={COLORS.primary} />
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

        <View style={styles.inputBar}>
          <TextInput
            style={styles.textInput}
            value={inputText}
            onChangeText={setInputText}
            placeholder="사주·MBTI에 대해 궁금한 점을 물어보세요..."
            placeholderTextColor={COLORS.textMuted}
            returnKeyType="send"
            onSubmitEditing={() => handleSend()}
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
          featureTitle="사주·MBTI AI 대화 무제한"
          featureDescription="무료 일일 5회 초과 시 weganda+로 무제한 심층 상담을 이용하세요"
        />

        <MembershipScreen
          visible={membershipVisible}
          onClose={() => setMembershipVisible(false)}
        />
      </KeyboardAvoidingView>
    </SwipeDismissModal>
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
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 8,
  },
  headerTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: COLORS.textPrimary,
    flexShrink: 1,
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
    fontSize: 15,
    lineHeight: 23,
  },
  bubbleTextMe: {
    color: '#FFFFFF',
  },
  bubbleTextAi: {
    color: COLORS.textPrimary,
  },
  timeText: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginTop: 4,
    paddingHorizontal: 4,
  },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
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
    paddingVertical: 11,
    fontSize: 15,
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
  limitBadge: {
    backgroundColor: '#FFF1F4',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    marginLeft: 6,
  },
  limitBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.primary,
  },
});

export default SajuChatModal;
