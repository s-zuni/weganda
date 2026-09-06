export interface MockStudyDoc {
  id: string;
  category: string;
  title: string;
  summary: string;
  content: string;
  readTime: string;
}

export const MOCK_STUDY_DOCS: MockStudyDoc[] = [
  {
    id: '1',
    category: '약물 계산',
    title: 'gtt/분 계산 공식 및 헤파린 투약 용량 완벽 정리',
    summary: '임상에서 가장 헷갈리는 점적 속도 계산 및 Infusion pump 세팅법',
    content: '1. gtt수 계산: (총 주입량(mL) × 점적계수(20gtt)) / (주입시간(분))\n2. cc/hr = 총 주입량(mL) / 주입시간(hr)',
    readTime: '3분',
  },
  {
    id: '2',
    category: '응급 간호',
    title: 'ACLS 심폐소생술 약물 투여 순서와 제세동기 적용',
    summary: 'Epi, Amiodarone 투여 타이밍 및 리듬 판독 핵심 요약',
    content: 'VF / Pulseless VT: Shock -> CPR 2min -> Shock -> Epi 1mg (3~5분 간격) -> Shock -> Amiodarone 300mg',
    readTime: '5분',
  },
  {
    id: '3',
    category: '검사/수치',
    title: 'ABGA 동맥혈 가스분석 결과 판독법 3단계',
    summary: 'pH, PaCO2, HCO3- 수치로 보는 산염기 불균형 판독 족보',
    content: 'pH: 7.35~7.45 | PaCO2: 35~45 mmHg | HCO3-: 22~26 mEq/L',
    readTime: '4분',
  },
];

