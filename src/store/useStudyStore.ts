import { create } from 'zustand';
import { StudyGuideItem, MOCK_STUDY_GUIDES } from '../mocks/studyData';

export interface AiChatMessage {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  time: string;
}

interface StudyState {
  studyGuides: StudyGuideItem[];
  aiMessages: AiChatMessage[];

  // Actions
  toggleBookmarkGuide: (guideId: string) => void;
  askAi: (question: string) => void;
}

export const useStudyStore = create<StudyState>((set) => ({
  studyGuides: MOCK_STUDY_GUIDES,
  aiMessages: [
    {
      id: 'ai_init',
      sender: 'ai',
      text: '안녕하세요! 우간다 임상 간호 AI 멘토입니다. 🩺\n약물 점적 계산, ACLS 프로토콜, SBAR 인수인계 노하우 등 궁금한 점을 편하게 물어보세요!',
      time: '오전 09:00',
    },
  ],

  toggleBookmarkGuide: (guideId: string) =>
    set((state) => ({
      studyGuides: state.studyGuides.map((g) =>
        g.id === guideId ? { ...g, isBookmarked: !g.isBookmarked } : g
      ),
    })),

  askAi: (question: string) =>
    set((state) => {
      const userMsg: AiChatMessage = {
        id: `user_${Date.now()}`,
        sender: 'user',
        text: question,
        time: '방금 전',
      };

      // Mock AI 지능형 임상 답변 생성
      let answer = '해당 질문에 대한 임상 지침을 검토 중입니다. 환자 안전 기준과 병원 표준 매뉴얼에 따라 투약 및 처치를 진행해 주세요.';
      const lower = question.toLowerCase();

      if (lower.includes('도파민') || lower.includes('계산') || lower.includes('gtt')) {
        answer = '💡 [도파민 점적 계산 요약]\n\n• 공식: (처방mcg × 체중kg × 60분) ÷ 약물농도(mcg/mL) = 주입속도(cc/hr)\n• 표준: 400mg/200mL 믹스 시 농도는 2,000mcg/mL입니다.\n• 60kg 환자 5mcg 처방 시: (5 × 60 × 60) ÷ 2,000 = 9 cc/hr로 인퓨전 펌프를 설정하세요!';
      } else if (lower.includes('acls') || lower.includes('제세동') || lower.includes('에피')) {
        answer = '⚡ [K-ACLS 심폐소생술 가이드]\n\n• Shockable 리듬 (VF/pVT): 200J 제세동 → 즉시 CPR 2분 → 2차 쇼크 후 에피네프린 1mg 투여.\n• 3차 쇼크 후: 아미오다론 300mg IV Bolus 투여.\n• Non-Shockable (PEA/Asystole): 제세동 금기! 즉시 에피네프린 1mg 조기 투여 및 가슴 압박 지속.';
      } else if (lower.includes('수혈') || lower.includes('혈액')) {
        answer = '🩸 [수혈 간호 핵심 3원칙]\n\n1. 간호사 2인이 환자 팔찌와 혈액백 라벨을 구두로 동시 확인합니다.\n2. 수혈 시작 첫 15분간은 15~20gtt로 천천히 주입하며 환자 곁에서 급성 반응을 관찰합니다.\n3. 농축적혈구(RBC) 1pack은 4시간 이내 주입을 완료해야 감염을 예방할 수 있습니다.';
      } else if (lower.includes('인계') || lower.includes('sbar')) {
        answer = '📋 [SBAR 인수인계 공식]\n\n• S (Situation): 환자명, 나이, 주호소 및 현재 발생한 문제 요약\n• B (Background): 입원일, 진단명, 주요 기저질환, 수술 이력\n• A (Assessment): 최근 V/S, Lab 이상치, 드레싱 및 라인 상태\n• R (Recommendation): 앞으로 필요한 검사, 투약 계획, 다음 근무자 요청 사항';
      }

      const aiMsg: AiChatMessage = {
        id: `ai_${Date.now() + 1}`,
        sender: 'ai',
        text: answer,
        time: '방금 전',
      };

      return {
        aiMessages: [...state.aiMessages, userMsg, aiMsg],
      };
    }),
}));

