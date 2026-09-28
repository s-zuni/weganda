import { supabase } from './supabase';
import { withClockSkewRetry } from '../utils/supabaseRetry';
import { SajuAnalysisResult } from './manseryeokService';
import { SajuTopicItem } from '../mocks/sajuCategories';

export interface SajuChatResponse {
  answer: string;
  createdAt: string;
}

export const sajuChatApi = {
  // 사주 심층 리포트 주제에 대한 1:1 AI 대화 (사주 + MBTI 통합 해석, Supabase Edge Function 경유)
  async askAboutTopic(params: {
    topic: SajuTopicItem;
    userSaju: SajuAnalysisResult;
    mbti?: string;
    reportContext?: { coreKeyword?: string; summaryQuote?: string };
    question: string;
    chatHistory?: { role: 'user' | 'assistant'; content: string }[];
  }): Promise<SajuChatResponse> {
    return withClockSkewRetry(async () => {
      const { data, error } = await supabase.functions.invoke('saju-chat', {
        body: {
          topic: params.topic,
          userSaju: params.userSaju,
          mbti: params.mbti,
          reportContext: params.reportContext,
          question: params.question,
          chat_history: params.chatHistory || [],
        },
      });

      if (error) {
        throw error;
      }
      if (data?.error) {
        throw new Error(data.error);
      }
      if (!data?.answer) {
        throw new Error('AI 응답 내용이 비어 있습니다.');
      }

      return {
        answer: data.answer as string,
        createdAt: data.createdAt || new Date().toISOString(),
      };
    });
  },
};
