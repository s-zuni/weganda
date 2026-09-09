import { supabase } from './supabase';
import { withClockSkewRetry } from '../utils/supabaseRetry';

export interface FortuneResult {
  title: string;
  fortuneText: string;
  overallScore: number;
  scores: {
    colleague: number;
    career: number;
    rest: number;
  };
  biorhythm: {
    injectionScore: number;
    communicationScore: number;
    mentalScore: number;
  };
  lucky: {
    item: string;
    color: string;
    number: number;
    direction: string;
  };
  advice: string;
  cached?: boolean;
}

export interface FortuneGenerateParams {
  fortuneType?: 'daily' | 'saju' | 'love' | 'career' | 'wealth';
  birthInfo?: {
    birthDate?: string;
    birthTime?: string;
    calendarType?: 'solar' | 'lunar';
    gender?: 'female' | 'male';
  };
  partnerInfo?: {
    birthDate?: string;
    birthTime?: string;
    mbti?: string;
  };
  colleagueInfo?: {
    name?: string;
    birthDate?: string;
    birthTime?: string;
  };
}

// 오프라인 또는 일시적 오류 시 기본 제공 운세 폴백
const DEFAULT_FORTUNE_FALLBACK: FortuneResult = {
  title: '오늘의 간호 운세',
  fortuneText: '동료와의 호흡이 편안하고 라운딩이 순조로운 날입니다. 침착한 처치로 환자들에게 신뢰를 얻겠어요.',
  overallScore: 92,
  scores: {
    colleague: 90,
    career: 93,
    rest: 94,
  },
  biorhythm: {
    injectionScore: 95,
    communicationScore: 90,
    mentalScore: 92,
  },
  lucky: {
    item: '3색 볼펜',
    color: '비바 코랄 핑크 (#FF507C)',
    number: 7,
    direction: '스테이션 동쪽',
  },
  advice: '스스로에게 따뜻한 칭찬 한마디를 건네보세요. 오늘도 수고 많으셨습니다.',
  cached: true,
};

export const fortuneApi = {
  // AI 간호 운세 & 바이오리듬 생성 (F1 ~ F5)
  async generateFortune(params?: FortuneGenerateParams): Promise<FortuneResult> {
    try {
      return await withClockSkewRetry(async () => {
        const { data, error } = await supabase.functions.invoke('fortune-generate', {
          body: {
            fortune_type: params?.fortuneType || 'daily',
            birth_info: params?.birthInfo,
            partner_info: params?.partnerInfo,
            colleague_info: params?.colleagueInfo,
          },
        });

        if (error || !data || !data.title) {
          return DEFAULT_FORTUNE_FALLBACK;
        }

        return data as FortuneResult;
      });
    } catch (e) {
      console.warn('Notice: using DEFAULT_FORTUNE_FALLBACK due to network or server state:', e);
      return DEFAULT_FORTUNE_FALLBACK;
    }
  },
};
