import { create } from 'zustand';
import { sajuChatApi } from '../services/sajuChatApi';
import { SajuAnalysisResult } from '../services/manseryeokService';
import { SajuTopicItem } from '../mocks/sajuCategories';

export interface SajuChatMessage {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  time: string;
}

interface FortuneChatState {
  messages: SajuChatMessage[];
  isThinking: boolean;
  activeTopicId?: string;

  // 새 주제의 리포트를 열 때 이전 대화 기록 초기화
  startChatForTopic: (topic: SajuTopicItem) => void;
  askAboutTopic: (params: {
    question: string;
    topic: SajuTopicItem;
    userSaju: SajuAnalysisResult;
    mbti?: string;
    reportContext?: { coreKeyword?: string; summaryQuote?: string };
  }) => Promise<void>;
}

export const useFortuneChatStore = create<FortuneChatState>((set, get) => ({
  messages: [],
  isThinking: false,
  activeTopicId: undefined,

  startChatForTopic: (topic) => {
    if (get().activeTopicId === topic.id) return;
    set({
      activeTopicId: topic.id,
      messages: [
        {
          id: 'ai_init',
          sender: 'ai',
          text: `안녕하세요, 50년 명리학 명인입니다. 🔮\n"${topic.title}" 리포트를 두고 더 깊이 알고 싶은 점을 편하게 물어보세요. 사주와 MBTI를 함께 살펴 답해드리겠습니다.`,
          time: new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit', hour12: false }),
        },
      ],
    });
  },

  askAboutTopic: async ({ question, topic, userSaju, mbti, reportContext }) => {
    const userMsgId = `user_${Date.now()}`;
    const userMsg: SajuChatMessage = {
      id: userMsgId,
      sender: 'user',
      text: question,
      time: new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit', hour12: false }),
    };

    const aiTempId = `ai_temp_${Date.now()}`;
    const aiTempMsg: SajuChatMessage = {
      id: aiTempId,
      sender: 'ai',
      text: '사주와 MBTI를 함께 짚어보고 있습니다... 🔮',
      time: new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit', hour12: false }),
    };

    set((state) => ({
      messages: [...state.messages, userMsg, aiTempMsg],
      isThinking: true,
    }));

    try {
      const history = get()
        .messages.filter((m) => m.id !== aiTempId && m.id !== userMsgId)
        .slice(-6)
        .map((m) => ({
          role: m.sender === 'user' ? ('user' as const) : ('assistant' as const),
          content: m.text,
        }));

      const res = await sajuChatApi.askAboutTopic({
        topic,
        userSaju,
        mbti,
        reportContext,
        question,
        chatHistory: history,
      });

      set((state) => ({
        messages: state.messages.map((m) =>
          m.id === aiTempId
            ? {
                ...m,
                text: res.answer,
                time: new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit', hour12: false }),
              }
            : m
        ),
        isThinking: false,
      }));
    } catch (e: any) {
      const errorMessage = e?.message || 'AI 명인의 답변을 가져오지 못했습니다. 잠시 후 다시 시도해 주세요.';
      set((state) => ({
        messages: state.messages.map((m) =>
          m.id === aiTempId ? { ...m, text: `⚠️ ${errorMessage}` } : m
        ),
        isThinking: false,
      }));
    }
  },
}));
