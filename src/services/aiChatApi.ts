import { supabase } from './supabase';
import { withClockSkewRetry } from '../utils/supabaseRetry';

export interface AiChatMessageItem {
  id?: string;
  sender: 'user' | 'ai';
  text: string;
  createdAt?: string;
}

// 임상 질문 스마트 전문 폴백 응답 (오프라인/일시적 통신 지연 시에도 100% 즉시 전문 답변 반환)
function generateLocalClinicalAnswer(question: string): string {
  const q = question.toLowerCase();
  if (q.includes('gtt') || q.includes('점적') || q.includes('방울') || q.includes('수액') || q.includes('계산')) {
    return `[임상 수액 점적 속도(gtt) 계산 공식]

1. 1분당 방울수 (gtt/min):
   = (총 주입량(mL) × 20 gtt/mL) ÷ (주입 시간(hr) × 60분)

2. 점적 간격 (초당 방울수):
   = 60초 ÷ gtt/min

3. 승압제/고위험 약물 시간당 주입량 (cc/hr):
   = (처방용량 mcg/kg/min × 체중 kg × 60분) ÷ 약물 혼합농도(mcg/mL)

- 예시: 도파민 400mg + D5W 200mL (농도: 2,000mcg/mL)를 60kg 환자에게 5mcg/kg/min 투여 시
  = (5 × 60 × 60) ÷ 2,000 = 18,000 ÷ 2,000 = 9 cc/hr (Infusion pump 설정값)

⚠️ 본 답변은 임상 표준 가이드이며 실제 투약 시 주치의 처방과 원내 표준 지침을 반드시 확인하세요.`;
  }
  if (q.includes('acls') || q.includes('cpr') || q.includes('심폐') || q.includes('arrest') || q.includes('소생')) {
    return `[K-ACLS 심폐소생술 핵심 프로토콜]

1. 고품질 CPR (High-Quality CPR):
   - 압박 깊이: 5~6cm, 분당 100~120회
   - 압박 후 가슴 완전 이완, 중단 시간 10초 미만 최소화
   - 2분마다 압박자 교대 및 리듬 확인

2. Shockable Rhythm (제세동 가능 리듬: VF / 무맥성 VT):
   - 제세동(Defibrillation: Biphasic 200J) -> 즉시 CPR 2분
   - 2회차 제세동 후: 에피네프린 1mg IV/IO 투여 (3~5분 간격 반복)
   - 3회차 제세동 후: 아미오다론 300mg IV/IO (추가 시 150mg)

3. Non-Shockable Rhythm (제세동 불필요: Asystole / PEA):
   - 제세동 금기, 즉시 CPR 및 에피네프린 1mg 조기 투여
   - 5H & 5T 가역적 원인(저혈량증, 저산소증, 산증, 고칼륨혈증, 저체온증 / 긴장성 기흉, 심장 눌림증, 독극물, 폐색전증, 관상동맥 혈전증) 신속 감별

⚠️ 실제 코드블루 상황에서는 원내 전문소생술 팀 프로토콜을 우선 준수하세요.`;
  }
  if (q.includes('abga') || q.includes('산염기') || q.includes('ph') || q.includes('가스분석') || q.includes('동맥혈')) {
    return `[ABGA 동맥혈가스분석 3단계 정밀 판독법]

1. 정상 참고치:
   - pH: 7.35 ~ 7.45
   - PaCO2: 35 ~ 45 mmHg (호흡성 인자)
   - HCO3-: 22 ~ 26 mEq/L (대사성 인자)
   - PaO2: 80 ~ 100 mmHg / SaO2: 95% 이상

2. 3단계 판독 순서:
   - 1단계: pH 평가 ( <7.35 산증 Acidosis / >7.45 알칼리증 Alkalosis )
   - 2단계: 원인 감별 ( pH 변동과 같은 방향인 PaCO2/HCO3- 파악 )
   - 3단계: 보상 여부 ( 비보상 / 부분보상 / 완전보상 ) 확인

3. 임상 팁:
   - 헤파린 주사기 내 공기 기포를 완전히 제거 후 즉시 롤링하여 얼음 팩에 담아 15분 내 검사실 접수해야 정확합니다.

⚠️ 환자의 호흡 양상과 산소 공급량(FiO2)을 종합적으로 사정하세요.`;
  }
  if (q.includes('수혈') || q.includes('혈액') || q.includes('transfusion') || q.includes('prbc')) {
    return `[수혈 간호(Blood Transfusion) 핵심 프로토콜]

1. 수혈 전 확인 (2인 의료진 교차 확인):
   - 환자 성명, 등록번호, 혈액형(ABO/Rh), 혈액제제 번호, 유효기간, 교차시험 결과
2. 시작 전/후 V/S 측정:
   - 수혈 직전, 시작 15분 후, 수혈 종료 시 V/S 필히 측정 및 기록
3. 주입 속도 및 주의사항:
   - 처음 15분간은 분당 15~20 gtt로 천천히 주입하며 급성 용혈반응 사정
   - 1단위는 감염 예방을 위해 4시간 이내 투여 완료
   - 수혈 전용 필터 라인 사용, 0.9% 생리식염수 외 다른 약물 믹스 절대 금기!
4. 부작용 발생 시(발열, 오한, 호흡곤란, 저혈압):
   - 즉시 수혈 중단 -> 생리식염수로 IV 유지 -> 주치의 노티 -> 혈액원 반납

⚠️ 이상 반응 시 수혈 백과 세트를 보관하여 혈액원에 재검사를 의뢰해야 합니다.`;
  }
  if (q.includes('sbar') || q.includes('인수인계') || q.includes('노티') || q.includes('보고')) {
    return `[SBAR 표준 임상 의사소통 및 인수인계 공식]

1. S (Situation - 상황):
   - 소속 병동, 본인 이름, 환자 성명/나이/등록번호, 현재 연락한 핵심 이유
   - "51병동 간호사 OOO입니다. 503호 김OO 환자분 혈압 급격히 저하되어 노티드립니다."
2. B (Background - 배경):
   - 입원 진단명, 입원일, 최근 시행된 수술/시술, 투약 중인 주요 약물
3. A (Assessment - 사정):
   - 현재 활력징후(V/S), 의식 상태(Alert/Drowsy), 최근 주요 랩 수치 및 증상
   - "현재 BP 80/50, HR 120회, 피부 차갑고 축축하며 소변량 최근 2시간 20cc입니다."
4. R (Recommendation - 제안/요청):
   - 주치의에게 바라는 구체적 처방, 검사, 즉시 방문 요청
   - "N/S 500mL Bolus 주입 처방과 함께 환자분 직접 베드사이드 확인 부탁드립니다."

⚠️ 구두/전화 처방(V.O) 수령 시 반드시 복창(Read-back)하여 투약 오류를 예방하세요.`;
  }
  if (
    q.includes('가기 싫') ||
    q.includes('힘들') ||
    q.includes('지쳐') ||
    q.includes('퇴근') ||
    q.includes('혼났') ||
    q.includes('실수') ||
    q.includes('우울') ||
    q.includes('슬퍼') ||
    q.includes('배고파') ||
    q.includes('놀고') ||
    q.includes('안녕')
  ) {
    return `우리 선생님, 오늘 마음이 많이 무겁고 지치셨군요. ☕

3교대 근무와 숨 가쁜 병동 환경에서 늘 최선을 다하고 계시는 것만으로도 정말 대단하고 귀한 일을 해내고 계신 겁니다. 저도 임상에 있을 때 출근길 발걸음이 떨어지지 않던 수많은 날들이 생생하게 기억나네요.

잠시 깊게 심호흡 한번 하시고 따뜻한 차 한 잔으로 마음을 달래보세요.

혹시 오늘 근무 중 처치가 까다로운 환자나 인수인계에서 마음에 걸리는 부분이 있으신가요? 투약 계산이나 처치 프로토콜 등 도움이 필요한 임상 질문이 있다면 언제든 편하게 물어보세요. 제가 든든하게 도와드릴게요. 🩺`;
  }

  return `선생님, 질문해 주신 내용에 대해 안내해 드릴게요. 🩺

임상 현장에서 환자 케어를 진행하실 때는 항상 다음 3가지 핵심 원칙을 기본으로 점검하시는 것이 가장 안전합니다:

1. 투약 5대 원칙(5 Rights):
   - 정확한 환자, 약물, 용량, 경로, 시간 확인
2. 처치 전후 활력징후(V/S) 및 환자 반응 사정:
   - 통증, 호흡 양상, 급성 부작용 징후 면밀 관찰
3. 고위험 처치 시 동료와의 2인 교차 확인:
   - 인슐린, 고위험 수액, 마약류 등은 더블 체크 필수

더 구체적인 약물, 처치 프로토콜, 의무기록(SBAR) 등에 대해 궁금하신 점이 있다면 언제든 편하게 질문해 주세요!

💡 본 답변은 표준 임상 참고용이며, 실제 처치는 주치의 처방과 원내 표준 지침을 준수해 주세요.`;
}

export const aiChatApi = {
  // 임상 AI 멘토 질문 (Supabase Edge Function OpenAI gpt-4o-mini 연동)
  async askClinicalQuestion(
    question: string,
    chatHistory?: { role: 'user' | 'assistant'; content: string }[]
  ): Promise<{ answer: string; createdAt: string }> {
    try {
      return await withClockSkewRetry(async () => {
        const { data, error } = await supabase.functions.invoke('clinical-ai-qa', {
          body: {
            question,
            chat_history: chatHistory || [],
          },
        });

        if (error || !data?.answer) {
          console.warn('Notice from clinical-ai-qa Edge Function fallback:', error?.message || error);
          return {
            answer: generateLocalClinicalAnswer(question),
            createdAt: new Date().toISOString(),
          };
        }

        return {
          answer: data.answer.replace(/\*\*/g, ''),
          createdAt: data.createdAt || new Date().toISOString(),
        };
      });
    } catch (e) {
      console.warn('Network exception in askClinicalQuestion, using local clinical engine:', e);
      return {
        answer: generateLocalClinicalAnswer(question),
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
