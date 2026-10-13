/**
 * medicalCitations.ts
 * 학습 탭(임상 가이드, 약물 계산기, Ask AI)에서 제공되는 의학·간호학 정보의
 * 공식 학술 출처 및 공공 보건의료 기관 링크 모음 (Apple App Store Guideline 1.4.1 준수)
 */

export interface MedicalCitation {
  id: string;
  agency: string;
  title: string;
  description: string;
  url: string;
  category?: '약물' | '응급' | '간호술기' | '일반';
}

export const OFFICIAL_MEDICAL_CITATIONS: MedicalCitation[] = [
  {
    id: 'kna',
    agency: '대한간호협회 (KNA)',
    title: '근거기반 임상간호실무지침 및 표준술기',
    description: '임상 핵심 간호술기 프로토콜, 투약 안전 5 Rights 및 표준 환자 모니터링 가이드라인',
    url: 'https://www.koreanurse.or.kr',
    category: '간호술기',
  },
  {
    id: 'khna',
    agency: '병원간호사회 (KHNA)',
    title: '병원 임상간호 실무지침서 및 수액요법 가이드',
    description: '점적속도(gtt/cc) 계산 공식, 수액세트 점적계수(20/60gtt), 고위험 약물 2인 교차확인 프로토콜',
    url: 'https://khna.or.kr',
    category: '약물',
  },
  {
    id: 'mfds',
    agency: '식품의약품안전처 (MFDS)',
    title: '의약품안전나라 의약품 통합정보 시스템',
    description: '대한민국 약전, 전문의약품 허가사항, 적응증, 용법·용량 및 병용 금기(DUR) 정보',
    url: 'https://nedrug.mfds.go.kr',
    category: '약물',
  },
  {
    id: 'ins',
    agency: '미국정맥주사간호사회 (INS)',
    title: 'Infusion Therapy Standards of Practice',
    description: '정맥주사 투약 속도 계산 표준, 중심정맥관 관리 및 일혈(Extravasation) 예방 지침',
    url: 'https://www.ins1.org',
    category: '약물',
  },
  {
    id: 'kacpr',
    agency: '대한심폐소생협회 (KACPR)',
    title: '한국형 심폐소생술 가이드라인 (K-ACLS)',
    description: '전문심폐소생술(ACLS) 알고리즘, 에피네프린 투약 주기 및 제세동 프로토콜',
    url: 'https://www.kacpr.org',
    category: '응급',
  },
  {
    id: 'kdca',
    agency: '질병관리청 (KDCA)',
    title: '국가건강정보포털 보건의료 임상 가이드',
    description: '감염 예방 표준 격리지침, 바이탈 사인 임상 참고치 및 만성질환 관리 정보',
    url: 'https://health.kdca.go.kr',
    category: '일반',
  },
];

export const MEDICAL_DISCLAIMER_TEXT =
  '본 학습 콘텐츠 및 약물 계산기는 간호 실무 보조 및 학습 목적의 참고 자료입니다. 실제 환자 처치 및 투약 시에는 반드시 담당 의사의 처방전과 소속 의료기관의 최신 표준 임상 프로토콜을 최종 확인하고 동료 간호사와 교차 검증해야 합니다.';
