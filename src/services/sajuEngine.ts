import {
  SAJU_ANALYSIS_GUIDE_MD,
  SAJU_GUIDE_METADATA,
} from '../constants/sajuAnalysisGuide';
import {
  sajuAnalysisGenerator,
  GeneratedSajuReport,
} from '../utils/sajuAnalysisGenerator';
import { SajuAnalysisResult } from './manseryeokService';
import { SajuTopicItem } from '../mocks/sajuCategories';

export interface SajuAnalysisEngineParams {
  topic: SajuTopicItem;
  userSaju: SajuAnalysisResult;
  partnerSaju?: SajuAnalysisResult;
  partnerName?: string;
  forceAi?: boolean;
}

const OPENAI_API_KEY =
  process.env.EXPO_PUBLIC_OPENAI_API_KEY ||
  process.env.OPENAI_API_KEY ||
  '';

/**
 * SAJU_ANALYSIS_GUIDE.md 파이프라인 엔진:
 * 모든 사용자 사주 분석 요청은 이 가이드 문서를 시스템 컨텍스트로 통과하여 생성됩니다.
 */
export const sajuEngine = {
  /**
   * 가이드 마크다운 전문 반환
   */
  getGuideMarkdown(): string {
    return SAJU_ANALYSIS_GUIDE_MD;
  },

  /**
   * 가이드 메타데이터 반환
   */
  getGuideMetadata() {
    return SAJU_GUIDE_METADATA;
  },

  /**
   * 사주 분석 실행 (SAJU_ANALYSIS_GUIDE.md 파이프라인 통과)
   */
  async analyzeSaju(params: SajuAnalysisEngineParams): Promise<GeneratedSajuReport> {
    const { topic, userSaju, partnerSaju, partnerName } = params;

    console.log(
      `[SajuEngine] Passing through ${SAJU_GUIDE_METADATA.filename} (v${SAJU_GUIDE_METADATA.version}) for topic: ${topic.title} (${topic.id})`
    );

    // 1단계: SAJU_ANALYSIS_GUIDE.md 기반 AI 감정 시도
    try {
      const aiReport = await this.generateViaAiWithGuide(params);
      if (aiReport && aiReport.sections && aiReport.sections.length >= 3) {
        console.log(`[SajuEngine] Successfully generated report via AI with ${SAJU_GUIDE_METADATA.filename}`);
        return {
          ...aiReport,
          appliedGuideVersion: `v${SAJU_GUIDE_METADATA.version}`,
          analyzedViaGuide: true,
          guideRuleRef: `${SAJU_GUIDE_METADATA.filename} §4 & §7 (AI Pipeline)`,
        };
      }
    } catch (err) {
      console.warn('[SajuEngine] AI call failed or timed out, falling back to deterministic guide generator:', err);
    }

    // 2단계: SAJU_ANALYSIS_GUIDE.md 표준 알고리즘 기반 확정적 엔진 실행
    const deterministicReport = sajuAnalysisGenerator.generateReport({
      topic,
      userSaju,
      partnerSaju,
      partnerName,
    });

    return {
      ...deterministicReport,
      appliedGuideVersion: `v${SAJU_GUIDE_METADATA.version}`,
      analyzedViaGuide: true,
      guideRuleRef: `${SAJU_GUIDE_METADATA.filename} §4 (${topic.id}) & §5`,
    };
  },

  /**
   * SAJU_ANALYSIS_GUIDE.md 제7장 규격에 따른 실시간 AI 프롬프트 주입 및 감정 호출
   */
  async generateViaAiWithGuide(params: SajuAnalysisEngineParams): Promise<GeneratedSajuReport | null> {
    if (!OPENAI_API_KEY) {
      return null;
    }

    const { topic, userSaju, partnerSaju, partnerName } = params;
    const { birthInfo, dayMaster, fiveElements, detectedShinsals, daewoon, pillars } = userSaju;

    // 제7장 주입 템플릿 빌드
    const userPrompt = `[User Saju Data]
- 생년월일: ${birthInfo.year}-${String(birthInfo.month).padStart(2, '0')}-${String(birthInfo.day).padStart(2, '0')} ${birthInfo.hour}:${birthInfo.minute} (${birthInfo.isLunar ? '음력' : '양력'}, ${birthInfo.gender === 'female' ? '여성' : '남성'})
- 사주 원국: 연주(${pillars.year.combinedKorean}/${pillars.year.combinedHanja}), 월주(${pillars.month.combinedKorean}/${pillars.month.combinedHanja}), 일주(${pillars.day.combinedKorean}/${pillars.day.combinedHanja}), 시주(${pillars.hour.combinedKorean}/${pillars.hour.combinedHanja})
- 본원(일간): ${dayMaster.natureTitle} (${dayMaster.stem})
- 오행 비율: ${fiveElements.map((e) => `${e.element} ${e.percentage}%`).join(', ')}
- 검출된 신살: ${detectedShinsals.map((s) => s.name).join(', ') || '정인귀기'}
- 10년 대운: 현재 ${daewoon.currentPillar?.age || daewoon.startAge}세 [${daewoon.currentPillar?.korean || ''}] 대운 통과 중

[Target Topic]
- 주제 ID: ${topic.id}
- 주제명: ${topic.title}
- 카테고리: ${topic.categoryId}
${partnerSaju ? `- 상대방 정보: 이름(${partnerName || '상대방'}), 일간(${partnerSaju.dayMaster.natureTitle}), 일주(${partnerSaju.pillars.day.combinedKorean})` : ''}

위 사용자의 사주팔자를 반드시 [SAJU_ANALYSIS_GUIDE.md]의 '제4장 14대 주제별 분석 알고리즘' 및 '제5장 리포트 출력 표준'에 입각하여 공백 제외 1,200자 이상의 5개 섹션 JSON으로 감정해 주십시오.`;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 12000); // 12초 타임아웃

    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${OPENAI_API_KEY}`,
      },
      signal: controller.signal,
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: `당신은 대한민국 최고의 50년 경력 사주명리학자이자 간호심리학 수석 자문관입니다.
반드시 아래 제공되는 [SAJU_ANALYSIS_GUIDE.md] 표준 가이드의 원칙, 페르소나, 간호 임상-사주 매트릭스, 그리고 주제별 지침을 철저히 거쳐서 감정 리포트를 작성하십시오:

${SAJU_ANALYSIS_GUIDE_MD}

반드시 순수한 JSON 규격으로만 응답해야 합니다. 스키마:
{
  "topicId": "${topic.id}",
  "topicTitle": "${topic.title}",
  "personaSummary": "50년 사주명리학 명인 & 간호심리 수석 자문관의 정밀 감정서",
  "overallScore": 92,
  "totalCharCount": 1350,
  "coreKeyword": "핵심 키워드 3단어",
  "summaryQuote": "50년 명인의 한 줄 총평 요약문",
  "sections": [
    {
      "title": "1. 사주 원국과 주제별 천명(天命) 총평",
      "badge": "원국 총평",
      "badgeColor": "#FF507C",
      "content": "상세 분석 본문 (최소 250자 이상)",
      "keyPoints": ["포인트1", "포인트2"]
    },
    {
      "title": "2. 기운(氣運) 및 신살(神煞)의 임상 발현",
      "badge": "신살 발현",
      "badgeColor": "#8B5CF6",
      "content": "상세 분석 본문 (최소 250자 이상)",
      "keyPoints": ["포인트1", "포인트2"]
    },
    {
      "title": "3. 대운세(大運勢) 및 시기별 흐름",
      "badge": "대운 흐름",
      "badgeColor": "#3B82F6",
      "content": "상세 분석 본문 (최소 250자 이상)",
      "keyPoints": ["포인트1", "포인트2"]
    },
    {
      "title": "4. 임상 실무 & 간호심리학적 맞춤 처방",
      "badge": "임상 처방",
      "badgeColor": "#10B981",
      "content": "상세 분석 본문 (최소 250자 이상)",
      "keyPoints": ["포인트1", "포인트2"]
    },
    {
      "title": "5. 50년 명리학자의 뼈때리는 직언(直言)",
      "badge": "명인 직언",
      "badgeColor": "#EF4444",
      "content": "상세 분석 본문 (최소 250자 이상)",
      "keyPoints": ["포인트1", "포인트2"]
    }
  ],
  "directAdvice": {
    "title": "50년 명리학자의 절대 금기(禁忌) 및 행동 수칙",
    "warning": "절대 피해야 할 위험한 행동",
    "actionRule": "반드시 실천해야 할 황금 수칙"
  },
  "infographicType": "general",
  "infographicData": {}
}`,
          },
          { role: 'user', content: userPrompt },
        ],
        response_format: { type: 'json_object' },
        temperature: 0.7,
      }),
    });

    clearTimeout(timeoutId);

    if (!res.ok) {
      console.warn(`[SajuEngine] OpenAI request failed with status ${res.status}`);
      return null;
    }

    const json = await res.json();
    const rawContent = json.choices?.[0]?.message?.content;
    if (!rawContent) return null;

    const parsed = JSON.parse(rawContent) as GeneratedSajuReport;
    
    // 인포그래픽 데이터 보완 (AI가 누락했을 경우 기본 템플릿 데이터 병합)
    const baseReport = sajuAnalysisGenerator.generateReport({
      topic,
      userSaju,
      partnerSaju,
      partnerName,
    });

    return {
      ...baseReport,
      ...parsed,
      infographicType: baseReport.infographicType,
      infographicData: {
        ...baseReport.infographicData,
        ...(parsed.infographicData || {}),
      },
    };
  },
};
