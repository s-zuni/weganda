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

const DIRECT_OPENAI_KEY =
  process.env.EXPO_PUBLIC_OPENAI_API_KEY ||
  process.env.OPENAI_API_KEY ||
  '';

async function fetchFromOpenAiDirect(params?: FortuneGenerateParams): Promise<FortuneResult | null> {
  if (!DIRECT_OPENAI_KEY) return null;

  const birthDateStr = params?.birthInfo?.birthDate || '1998-05-14';
  const birthTimeStr = params?.birthInfo?.birthTime || '미상';
  const calendarTypeStr = params?.birthInfo?.calendarType === 'lunar' ? '음력' : '양력';
  const genderStr = params?.birthInfo?.gender === 'male' ? '남성' : '여성';
  const fortuneType = params?.fortuneType || 'daily';

  let userPrompt = `[간호사 사주 정보]
- 생년월일: ${birthDateStr} (${calendarTypeStr}, ${genderStr})
- 태어난 시간: ${birthTimeStr}
- 운세 요청 유형: ${fortuneType}`;

  if (params?.partnerInfo?.birthDate) {
    userPrompt += `\n[상대방] 생년월일: ${params.partnerInfo.birthDate}, 시간: ${params.partnerInfo.birthTime || '미상'}, MBTI: ${params.partnerInfo.mbti || '미상'}`;
  }
  if (params?.colleagueInfo?.name) {
    userPrompt += `\n[동료] 이름: ${params.colleagueInfo.name}, 생년월일: ${params.colleagueInfo.birthDate || '미상'}`;
  }

  userPrompt += `\n\n위 간호사의 오늘 운세와 바이오리듬 점수를 간호 현장(교대, 처치, 라운딩, 소통 등)에 맞게 정밀 분석하여 JSON 규격으로 반환해 주세요.`;

  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${DIRECT_OPENAI_KEY}`,
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: `당신은 대한민국 3교대 간호사를 위한 일일 사주 및 바이오리듬 운세 전문 AI입니다.
반드시 아래 JSON 형식만을 순수하게 반환하세요:
{
  "title": "오늘의 간호 운세 한줄 요약",
  "fortuneText": "오늘 근무와 처치, 라운딩에 관한 2~3문장의 따뜻하고 명확한 운세 (마크다운 볼드 ** 절대 금지)",
  "overallScore": 92,
  "scores": {
    "colleague": 90,
    "career": 93,
    "rest": 94
  },
  "biorhythm": {
    "injectionScore": 95,
    "communicationScore": 90,
    "mentalScore": 92
  },
  "lucky": {
    "item": "행운의 간호용품 (예: 3색 볼펜, 압박스타킹, 텀블러 등)",
    "color": "행운의 색상 (예: 비바 코랄 핑크, 스카이 블루 등)",
    "number": 7,
    "direction": "행운의 방향 (예: 스테이션 동쪽)"
  },
  "advice": "오늘 하루를 지탱해 줄 따뜻한 한마디 조언"
}`,
        },
        { role: 'user', content: userPrompt },
      ],
      response_format: { type: 'json_object' },
      temperature: 0.7,
    }),
  });

  if (!res.ok) {
    const errorBody = await res.text().catch(() => '');
    console.warn(`OpenAI Direct Call failed (${res.status}):`, errorBody);
    return null;
  }

  const json = await res.json();
  const content = json.choices?.[0]?.message?.content;
  if (!content) return null;

  return JSON.parse(content) as FortuneResult;
}

export const fortuneApi = {
  // AI 간호 운세 & 바이오리듬 생성 (F1 ~ F5)
  async generateFortune(params?: FortuneGenerateParams): Promise<FortuneResult> {
    try {
      // 1. Supabase Edge Function 호출 시도
      const edgeResult = await withClockSkewRetry(async () => {
        const { data, error } = await supabase.functions.invoke('fortune-generate', {
          body: {
            fortune_type: params?.fortuneType || 'daily',
            birth_info: params?.birthInfo,
            partner_info: params?.partnerInfo,
            colleague_info: params?.colleagueInfo,
          },
        });

        if (error || !data || !data.title) {
          return null;
        }

        return data as FortuneResult;
      });

      if (edgeResult) {
        return edgeResult;
      }

      // 2. Edge Function 미배포/오류 시 OpenAI 직접 호출 시도 (키 설정 시)
      const directResult = await fetchFromOpenAiDirect(params).catch((e) => {
        console.warn('Notice in fetchFromOpenAiDirect:', e);
        return null;
      });

      if (directResult && directResult.title) {
        return directResult;
      }

      return DEFAULT_FORTUNE_FALLBACK;
    } catch (e) {
      console.warn('Notice: using DEFAULT_FORTUNE_FALLBACK due to network or server state:', e);
      return DEFAULT_FORTUNE_FALLBACK;
    }
  },
};
