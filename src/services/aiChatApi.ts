import { supabase } from './supabase';
import { withClockSkewRetry } from '../utils/supabaseRetry';

export interface AiChatMessageItem {
  id?: string;
  sender: 'user' | 'ai';
  text: string;
  createdAt?: string;
}

export interface AiChatMessageItem {
  id?: string;
  sender: 'user' | 'ai';
  text: string;
  createdAt?: string;
}

export const aiChatApi = {
  // 임상 AI 멘토 질문 (Supabase Edge Function OpenAI gpt-4o-mini 연동)
  async askClinicalQuestion(
    question: string,
    chatHistory?: { role: 'user' | 'assistant'; content: string }[]
  ): Promise<{ answer: string; createdAt: string }> {
    return await withClockSkewRetry(async () => {
      const { data, error } = await supabase.functions.invoke('clinical-ai-qa', {
        body: {
          question,
          chat_history: chatHistory || [],
        },
      });

      if (error) {
        // FunctionsHttpError 등 실제 에러 메시지 추출
        let errMsg = error.message || 'AI 멘토 응답을 가져오지 못했습니다.';
        if ((error as any).context?.text) {
          try {
            const parsed = JSON.parse(await (error as any).context.text());
            if (parsed.error) errMsg = parsed.error;
          } catch (_) {}
        }
        throw new Error(errMsg);
      }

      if (data?.error) {
        throw new Error(data.error);
      }

      if (!data?.answer) {
        throw new Error('AI 응답 내용이 비어 있습니다. 다시 질문해 주세요.');
      }

      return {
        answer: data.answer.replace(/\*\*/g, ''),
        createdAt: data.createdAt || new Date().toISOString(),
      };
    });
  },

  // AI 대화 히스토리 조회 (AI2)
  async getChatHistory(userId: string): Promise<AiChatMessageItem[]> {
    return withClockSkewRetry(async () => {
      const { data, error } = await supabase
        .from('ai_chat_history')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: true })
        .limit(50);

      if (error) {
        console.warn('Notice fetching AI chat history:', error);
        return [];
      }

      return (data || []).map((row) => ({
        id: row.id,
        sender: row.role === 'assistant' ? 'ai' : 'user',
        text: row.content,
        createdAt: row.created_at || undefined,
      }));
    });
  },
};
