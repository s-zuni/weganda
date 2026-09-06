import { supabase } from './supabase';
import { withClockSkewRetry } from '../utils/supabaseRetry';

export interface AiChatMessageItem {
  id?: string;
  sender: 'user' | 'ai';
  text: string;
  createdAt?: string;
}

export const aiChatApi = {
  // 임상 AI 멘토 질문 (AI1 - OpenAI gpt-5.6-luna)
  async askClinicalQuestion(
    question: string,
    chatHistory?: { role: 'user' | 'assistant'; content: string }[]
  ): Promise<{ answer: string; createdAt: string }> {
    return withClockSkewRetry(async () => {
      const { data, error } = await supabase.functions.invoke('clinical-ai-qa', {
        body: {
          question,
          chat_history: chatHistory || [],
        },
      });

      if (error) {
        console.warn('Notice from clinical-ai-qa Edge Function:', error.message || error);
        throw error;
      }

      return data as { answer: string; createdAt: string };
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
