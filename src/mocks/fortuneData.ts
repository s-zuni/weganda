// ─── 오행 및 간호 사주 시각화 데이터 ─────────────────────
import {
  ElementRatio,
  WardCompatibility,
  NurseDutyDifficulty,
  LoveFortuneData,
  CareerFortuneData,
  WealthFortuneData,
} from '../types/fortune';
export type {
  ElementRatio,
  WardCompatibility,
  NurseDutyDifficulty,
  LoveFortuneData,
  CareerFortuneData,
  WealthFortuneData,
};

export const MOCK_FIVE_ELEMENTS: ElementRatio[] = [
  { element: '화(火)', percentage: 35, color: '#FF507C', desc: '열정과 순발력, 빠른 위기 대처' },
  { element: '목(木)', percentage: 25, color: '#10B981', desc: '성장과 공감, 환자 치유 능력' },
  { element: '토(土)', percentage: 15, color: '#F59E0B', desc: '안정감과 끈기, 꼼꼼한 기록' },
  { element: '금(金)', percentage: 15, color: '#6B7280', desc: '원칙과 정확성, 투약 무결점' },
  { element: '수(水)', percentage: 10, color: '#3B82F6', desc: '유연한 대처, 야간 집중력' },
];

export const MOCK_WARD_RANKINGS: WardCompatibility[] = [
  { rank: 1, ward: '응급실 (ER)', score: 98, badge: '최상', reason: '강한 화(火) 기운으로 응급 상황에서 놀라운 순발력 발휘' },
  { rank: 2, ward: '중환자실 (ICU)', score: 92, badge: '우수', reason: '금(金)과 목(木)의 조화로 정밀 기기 조작 및 환자 모니터링 적합' },
  { rank: 3, ward: '일반 병동 (Ward)', score: 86, badge: '양호', reason: '공감 능력이 뛰어나 라운딩 시 환자 및 보호자 신뢰도 높음' },
  { rank: 4, ward: '수술실 (OR)', score: 79, badge: '보통', reason: '정적인 장시간 수술보다 동적인 처치 환경에서 스트레스 덜 받음' },
];

export const MOCK_DUTY_DIFFICULTY: NurseDutyDifficulty[] = [
  { category: '칼퇴 및 오버타임', score: 92, status: '최고', comment: '인수인계가 매끄럽게 끝나 정시 퇴근 가능성 매우 높음' },
  { category: '동료/인차지 케미', score: 95, status: '최고', comment: '오늘 함께 근무하는 동료와의 팀워크가 최상입니다' },
  { category: '환자/보호자 관계', score: 88, status: '좋음', comment: '특별한 컴플레인 없이 원활한 소통이 이어지는 하루' },
  { category: '돌발 응급 상황', score: 30, status: '주의', comment: '오후 2시경 급작스러운 이벤트 가능성 있으니 사전 점검 필수' },
];

// ─── 애정운 목데이터 ────────────────────────────────────


export const MOCK_LOVE_FORTUNE: LoveFortuneData = {
  coupleScore: 94,
  sajuCompatibility: '음양의 조화가 완벽한 상생 궁합으로, 서로의 결점을 덮어주고 교대 근무의 피로를 힐링해주는 천생연분입니다.',
  mbtiSolution: {
    userMbti: 'ENFP',
    partnerMbti: 'ISTJ',
    chemistry: '최고의 상호보완 콤비 (95점)',
    solution: '간호사의 불규칙한 근무 일정을 계획적인 상대방이 든든하게 서포트해 줍니다. 감정 표현을 아끼지 마세요!',
  },
  crushTimeline: [
    { timing: '이번 주', action: '가벼운 커피 나눔', strategy: '근무 교대 전 시원한 음료와 함께 짧은 안부를 건네보세요.' },
    { timing: '2주 후', action: '공통 관심사 대화', strategy: '쉬는 날 취미나 맛집 이야기를 꺼내며 자연스럽게 1:1 대화 유도.' },
    { timing: '다음 달 초', action: '진심 고백 타이밍', strategy: '금(金)과 수(水) 기운이 상승하는 날, 둘만의 저녁 약속에서 마음을 표현하세요.' },
  ],
  marriageAdvice: {
    score: 91,
    pros: ['경제관념이 일치하여 재정적 안정이 빠름', '서로의 전문 영역을 존중하며 깊은 신뢰 형성'],
    cautions: ['3교대 근무로 인한 수면 패턴 차이를 배려하는 생활 룰 정립 필요'],
  },
};

// ─── 직업운 목데이터 ────────────────────────────────────


export const MOCK_CAREER_FORTUNE: CareerFortuneData = {
  tenYearGreatFlow: [
    { year: 2024, score: 70, label: '적응기' },
    { year: 2025, score: 80, label: '역량 강화' },
    { year: 2026, score: 95, label: '대운 상승 (이직/승진)' },
    { year: 2027, score: 90, label: '전문성 확립' },
    { year: 2028, score: 85, label: '안정기' },
    { year: 2029, score: 88, label: '새로운 도전' },
  ],
  transferHospitals: [
    { hospital: '서울아산병원', matchScore: 96, timing: '2026년 하반기', advantage: '사용자의 목(木) 기운과 풍수 궁합 최상, 상급종합 전문성 극대화' },
    { hospital: '삼성서울병원', matchScore: 91, timing: '2027년 상반기', advantage: '첨단 시스템과의 궁합 양호, 전담간호사(PA) 커리어 도약' },
    { hospital: '국립암센터', matchScore: 88, timing: '2026년 10월', advantage: '연구 및 전문 간호 영역 확장에 유리한 사주 대운' },
  ],
  colleagueChemistry: [
    { name: '김민지 간호사 (동기)', dutyRole: '이브닝 콤비', chemistryScore: 98, comment: '서로 눈빛만 봐도 투약/처치 손발이 척척 맞는 최강 듀오' },
    { name: '이수현 차지간호사', dutyRole: '인차지', chemistryScore: 89, comment: '엄격하지만 정확한 피드백으로 나를 크게 성장시켜 줄 귀인' },
  ],
};

// ─── 금전운 목데이터 ────────────────────────────────────


export const MOCK_WEALTH_FORTUNE: WealthFortuneData = {
  wealthTendency: [
    { trait: '저축 안정성', score: 85, description: '나이트 수당 및 정기 상여금을 꾸준히 모으는 성향' },
    { trait: '스트레스 소비', score: 60, description: '연속 3교대 후 힐링 쇼핑 충동이 생기기 쉬움' },
    { trait: '재테크 실행력', score: 78, description: '공부한 내용을 실천으로 옮기는 추진력 우수' },
    { trait: '투자 리스크 관리', score: 90, description: '무리한 투자보다 원금 보존형 자산 선호' },
  ],
  investmentPortfolio: [
    { asset: '미국 지수 ETF / 배당주', ratio: 40, color: '#3B82F6', recommendation: '야간 수당 정기 적립식 매수' },
    { asset: '청약 / 고금리 파킹통장', ratio: 35, color: '#10B981', recommendation: '내 집 마련 및 비상 자금' },
    { asset: '자기계발 / 건강 관리', ratio: 15, color: '#FF507C', recommendation: '영양제, 필라테스, 간호 전문 자격' },
    { asset: '자유 힐링 자금', ratio: 10, color: '#F59E0B', recommendation: '오프 날 여행 및 취미' },
  ],
  wealthTimeline: [
    { period: '2026년 3분기', type: '유입(입금)', amount: '목돈 유입', guide: '상여금 및 연차 정산금 수령, 비상금 통장으로 즉시 분리 권장' },
    { period: '2026년 4분기', type: '지출(유출)', amount: '지출 주의', guide: '겨울철 해외여행 및 쇼핑 지출 통제 필요' },
    { period: '2027년 1분기', type: '성장', amount: '자산 점프', guide: '적금 만기 및 투자 수익 실현으로 총자산 1단계 도약' },
  ],
};

