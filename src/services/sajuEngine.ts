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
import { supabase } from './supabase';
import { withClockSkewRetry } from '../utils/supabaseRetry';

export interface SajuAnalysisEngineParams {
  topic: SajuTopicItem;
  userSaju: SajuAnalysisResult;
  partnerSaju?: SajuAnalysisResult;
  partnerName?: string;
  forceAi?: boolean;
}

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
   * SAJU_ANALYSIS_GUIDE.md 제7장 규격에 따른 실시간 AI 프롬프트 주입 및 감정 호출.
   * OpenAI 호출은 반드시 Supabase Edge Function(`saju-analyze`)을 경유한다 —
   * OPENAI_API_KEY는 Edge Function 서버 환경변수로만 존재하며 클라이언트 번들에는 절대 포함되지 않는다.
   */
  async generateViaAiWithGuide(params: SajuAnalysisEngineParams): Promise<GeneratedSajuReport | null> {
    const { topic, userSaju, partnerSaju, partnerName } = params;

    const { data, error } = await withClockSkewRetry(() =>
      supabase.functions.invoke('saju-analyze', {
        body: { topic, userSaju, partnerSaju, partnerName },
      })
    );

    if (error || !data || !data.sections) {
      return null;
    }

    const parsed = data as GeneratedSajuReport;

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
