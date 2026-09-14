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

const LUCKY_COLORS = [
  '비바 코랄 핑크 (#FF507C)',
  '포레스트 에메랄드 (#10B981)',
  '클리어 스카이 블루 (#3B82F6)',
  '라벤더 퍼플 (#8B5CF6)',
  '선셋 골드 옐로우 (#F59E0B)',
  '소프트 민트 그린 (#34D399)',
  '딥 네이비 블루 (#1E3A8A)',
  '로즈 블러셔 (#FB7185)',
  '차분한 웜 베이지 (#D97706)',
];

const LUCKY_NUMBERS = [1, 2, 3, 5, 7, 8, 9, 11, 14, 17, 21, 28, 33, 77];

const LUCKY_DIRECTIONS = [
  '스테이션 동쪽 (목(木) 생기 방위)',
  '남측 채광 라운지 (화(火) 활력 방위)',
  '서편 약국 및 처치실 (금(金) 결단 방위)',
  '북측 조용한 회의실 (수(水) 휴식 방위)',
  '널싱 스테이션 정중앙 (토(土) 중심 방위)',
  '동남향 창가 복도 (목화(木火) 상생 방위)',
  '서북향 차분한 스테이션 (금수(金水) 청량 방위)',
];

const LUCKY_ITEMS = [
  '부드러운 3색 젤펜',
  '포켓용 안전 의료 가위',
  '종아리 압박 스타킹',
  '보온 티 텀블러',
  '클립형 실리콘 시계',
  '고보습 시어버터 핸드크림',
  '상큼한 비타민 캔디',
  '라인 정리용 밴드 테이프',
];

const DAILY_TITLES = [
  '동료와의 팀워크가 빛을 발하는 날',
  '손끝의 감각이 살아나 처치가 매끄러운 날',
  '환자와의 라포가 따뜻하게 통하는 날',
  '침착한 판단으로 정시 퇴근에 다가서는 날',
  '새로운 배움과 전문성이 한 단계 도약하는 날',
  '마음의 여유와 잔잔한 평온이 깃드는 날',
];

const DAILY_FORTUNES = [
  '동료와의 호흡이 편안하고 라운딩이 순조로운 하루입니다. 침착한 처치와 온화한 미소로 병동 분위기를 밝게 이끌겠어요.',
  '오후 인수인계와 바이탈 체크가 물 흐르듯 신속하게 진행됩니다. 집중력이 최고조에 달해 돌발 상황도 여유 있게 대처합니다.',
  '작은 배려가 큰 신뢰로 돌아오는 길한 날입니다. 동료 간호사가 건네는 따뜻한 간식이나 응원의 말이 큰 힘이 되어 줍니다.',
  '처치 난이도가 높은 환자도 단번에 안정시킬 수 있는 날입니다. 본인의 직관을 믿고 원칙대로 차분히 임상에 임하십시오.',
  '오늘 번표의 듀티 흐름이 상생의 기운을 탑니다. 칼퇴의 가능성이 높으니 업무 후 나만을 위한 힐링 시간을 계획해 보세요.',
];

const DAILY_ADVICES = [
  '바쁜 일과 중에도 깊은 심호흡 세 번으로 마음의 평정심을 유지하세요.',
  '동료에게 건네는 따뜻한 수고 한마디가 다시 나에게 든든한 방패로 돌아옵니다.',
  '퇴근 후에는 온전히 나만의 안식을 즐기며 오늘의 피로를 씻어내세요.',
  '충분한 수분 섭취와 스트레칭으로 굳어진 어깨를 부드럽게 풀어주세요.',
  '당신은 이미 환자와 동료들에게 없어서는 안 될 소중하고 빛나는 존재입니다.',
];

// 동적 일일 운세 생성기 (오프라인/폴백 시에도 매일/클릭 시 갱신 보장)
export function getDynamicDailyFortune(params?: FortuneGenerateParams): FortuneResult {
  const rand = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];
  const overallScore = Math.floor(Math.random() * 9) + 90; // 90 ~ 98

  return {
    title: rand(DAILY_TITLES),
    fortuneText: rand(DAILY_FORTUNES),
    overallScore,
    scores: {
      colleague: Math.floor(Math.random() * 8) + 90,
      career: Math.floor(Math.random() * 8) + 90,
      rest: Math.floor(Math.random() * 8) + 90,
    },
    biorhythm: {
      injectionScore: Math.floor(Math.random() * 8) + 90,
      communicationScore: Math.floor(Math.random() * 8) + 90,
      mentalScore: Math.floor(Math.random() * 8) + 90,
    },
    lucky: {
      item: rand(LUCKY_ITEMS),
      color: rand(LUCKY_COLORS),
      number: rand(LUCKY_NUMBERS),
      direction: rand(LUCKY_DIRECTIONS),
    },
    advice: rand(DAILY_ADVICES),
    cached: false,
  };
}

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

      return getDynamicDailyFortune(params);
    } catch (e) {
      console.warn('Notice: using getDynamicDailyFortune due to network or server state:', e);
      return getDynamicDailyFortune(params);
    }
  },
};
