import { supabase } from './supabase';
import { withClockSkewRetry } from '../utils/supabaseRetry';

export interface AiChatMessageItem {
  id?: string;
  sender: 'user' | 'ai';
  text: string;
  createdAt?: string;
}

export interface ClinicalSourceItem {
  title: string;
  sourceAgency: string;
  year?: string;
}

export interface AiClinicalResponse {
  answer: string;
  sources?: ClinicalSourceItem[];
  createdAt: string;
}

export const aiChatApi = {
  // 임상 AI 멘토 질문 (Supabase Edge Function / RAG 하이브리드 지식 검색)
  async askClinicalQuestion(
    question: string,
    chatHistory?: { role: 'user' | 'assistant'; content: string }[]
  ): Promise<AiClinicalResponse> {
    try {
      return await withClockSkewRetry(async () => {
        const { data, error } = await supabase.functions.invoke('clinical-ai-qa', {
          body: {
            question,
            chat_history: chatHistory || [],
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
          answer: data.answer.replace(/\*\*/g, ''),
          sources: data.sources || [],
          createdAt: data.createdAt || new Date().toISOString(),
        };
      });
    } catch (functionErr) {
      console.warn('Edge function invoke failed, fallback to client-side RAG RPC:', functionErr);

      // 클라이언트 측 RAG RPC 직통 폴백 (Supabase pgvector 지식 검색)
      try {
        const keywords = ['cre', 'vre', '격리', '접촉주의', '공기주의', '결핵', '린넨', '소독', '분쇄', '서방정', '장용정', 'kcl', '염화칼륨', '수혈', 'l-tube', '비위관'];
        const matchedKw = keywords.find((kw) => question.toLowerCase().includes(kw)) || '';
        const queryTerm = matchedKw || question.trim().slice(0, 20);

        const { data: chunks, error: rpcErr } = await supabase.rpc('search_clinical_knowledge', {
          query_text: queryTerm,
          query_embedding: null,
          match_threshold: 0.5,
          match_count: 2,
        });

        if (!rpcErr && chunks && chunks.length > 0) {
          const sources: ClinicalSourceItem[] = chunks.map((c: any) => ({
            title: c.title,
            sourceAgency: c.source_agency,
            year: c.publication_year || '2024',
          }));

          const contextText = chunks
            .map(
              (c: any, i: number) =>
                `📌 [${c.title} - ${c.source_agency} (${c.publication_year || '2024'})]\n${c.content}`
            )
            .join('\n\n');

          return {
            answer: `선생님, 문의하신 임상 표준 지침 안내해 드릴게요. 🩺\n\n${contextText}\n\n💡 환자 안전을 위해 반드시 담당 주치의의 오더와 원내 표준 실무 지침을 함께 재확인해 주세요.`,
            sources,
            createdAt: new Date().toISOString(),
          };
        }
      } catch (rpcErr) {
        console.warn('RAG RPC fallback error:', rpcErr);
      }

      // 기본 공감 및 안전 안내 폴백
      return {
        answer: '선생님, 오늘 근무 정말 고생 많으셨어요. 🩺\n문의하신 내용에 대해 원내 표준 간호 실무 지침 및 담당 주치의 처방을 함께 확인하여 안전하게 간호 처치하시길 권장드립니다.\n\n⚠️ 본 안내는 참고용이며 실제 처치는 원내 프로토콜을 우선 준수해 주세요.',
        sources: [],
        createdAt: new Date().toISOString(),
      };
    }
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
