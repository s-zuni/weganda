import { create } from 'zustand';
import { StudyGuideItem, MOCK_STUDY_GUIDES } from '../mocks/studyData';
import { studyApi } from '../services/studyApi';
import { aiChatApi } from '../services/aiChatApi';

export interface AiChatMessage {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  time: string;
}

interface StudyState {
  studyGuides: StudyGuideItem[];
  aiMessages: AiChatMessage[];
  isLoadingGuides: boolean;
  isAiThinking: boolean;

  // Actions
  fetchStudyGuides: (category?: string) => Promise<void>;
  toggleBookmarkGuide: (guideId: string) => void;
  askAi: (question: string) => Promise<void>;
}

export const useStudyStore = create<StudyState>((set, get) => ({
  studyGuides: MOCK_STUDY_GUIDES,
  isLoadingGuides: false,
  isAiThinking: false,

  aiMessages: [
    {
      id: 'ai_init',
      sender: 'ai',
      text: '안녕하세요! 우간다 임상 간호 AI 멘토(OpenAI)입니다. 🩺\n약물 점적 계산(gtt), ACLS 프로토콜, ABGA 판독, SBAR 인수인계 공식 등 임상 실무에 대해 무엇이든 물어보세요!',
      time: '오전 09:00',
    },
  ],

  // Supabase DB에서 지침서 목록 실시간 조회
  fetchStudyGuides: async (category?: string) => {
    try {
      set({ isLoadingGuides: true });
      const dbGuides = await studyApi.getStudyGuides(category);
      if (dbGuides && dbGuides.length > 0) {
        const mapped: StudyGuideItem[] = dbGuides.map((g, idx) => {
          // 기존 북마크 상태 유지
          const existing = get().studyGuides.find((item) => item.id === g.id || item.title === g.title);
          const iconType = (g.icon as any) || 'book';
          const iconBg =
            g.category === '약물 계산'
              ? '#FFF1F4'
              : g.category === '응급 간호'
              ? '#FEF3C7'
              : g.category === '임상 술기'
              ? '#FEE2E2'
              : '#E0E7FF';

          return {
            id: g.id,
            title: g.title,
            category: g.category as any,
            summary: g.summary,
            iconType,
            iconBg,
            author: '우간다 임상 연구팀',
            meta: `${g.category} · ${g.readTime || '3분'}`,
            views: 500 + idx * 120,
            isBookmarked: existing?.isBookmarked || false,
            keyPoints: g.content.split('\n').filter((l) => l.trim().length > 0).slice(0, 3),
            dangerAlert: g.content.includes('⚠️')
              ? g.content.split('⚠️')[1]?.trim()
              : undefined,
            fullContent: g.content.split('\n').filter((l) => l.trim().length > 0),
          };
        });
        set({ studyGuides: mapped, isLoadingGuides: false });
      } else {
        set({ isLoadingGuides: false });
      }
    } catch (e) {
      console.warn('Error fetching study guides from DB:', e);
      set({ isLoadingGuides: false });
    }
  },

  toggleBookmarkGuide: (guideId: string) =>
    set((state) => ({
      studyGuides: state.studyGuides.map((g) =>
        g.id === guideId ? { ...g, isBookmarked: !g.isBookmarked } : g
      ),
    })),

  // OpenAI gpt-5.6-luna 기반 실시간 임상 Q&A
  askAi: async (question: string) => {
    const userMsgId = `user_${Date.now()}`;
    const userMsg: AiChatMessage = {
      id: userMsgId,
      sender: 'user',
      text: question,
      time: new Date().toLocaleTimeString('ko-KR', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
      }),
    };

    const aiTempId = `ai_temp_${Date.now()}`;
    const aiTempMsg: AiChatMessage = {
      id: aiTempId,
      sender: 'ai',
      text: '임상 지침과 프로토콜을 분석하고 있습니다... ⏳',
      time: new Date().toLocaleTimeString('ko-KR', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
      }),
    };

    // 낙관적 UI: 사용자 질문 및 AI 생각 중 메시지 추가
    set((state) => ({
      aiMessages: [...state.aiMessages, userMsg, aiTempMsg],
      isAiThinking: true,
    }));

    try {
      // 이전 대화 히스토리 추출
      const history = get()
        .aiMessages.filter((m) => m.id !== aiTempId && m.id !== userMsgId)
        .slice(-6)
        .map((m) => ({
          role: m.sender === 'user' ? ('user' as const) : ('assistant' as const),
          content: m.text,
        }));

      // 실제 Supabase Edge Function (OpenAI gpt-5.6-luna) 호출
      const res = await aiChatApi.askClinicalQuestion(question, history);

      const finalAnswer = res.answer || '답변을 불러오지 못했습니다. 다시 시도해주세요.';

      // 실제 응답으로 교체
      set((state) => ({
        aiMessages: state.aiMessages.map((m) =>
          m.id === aiTempId
            ? {
                ...m,
                text: finalAnswer,
                time: new Date().toLocaleTimeString('ko-KR', {
                  hour: '2-digit',
                  minute: '2-digit',
                  hour12: false,
                }),
              }
            : m
        ),
        isAiThinking: false,
      }));
    } catch (e: any) {
      console.warn('Error from aiChatApi:', e);
      set((state) => ({
        aiMessages: state.aiMessages.map((m) =>
          m.id === aiTempId
            ? {
                ...m,
                text: '일시적인 네트워크 오류가 발생했습니다. 잠시 후 다시 질문해주세요.',
              }
            : m
        ),
        isAiThinking: false,
      }));
    }
  },
}));
