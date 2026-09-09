export type SajuCategoryId = 'nurse' | 'chemistry' | 'career' | 'love' | 'wealth';

export interface SajuTopicItem {
  id: string;
  categoryId: SajuCategoryId;
  title: string;
  subtitle: string;
  badge: string;
  badgeColor: string;
  tags: string[];
  description: string;
  requiresPartner?: boolean;
  partnerType?: 'colleague' | 'preceptor' | 'partner';
  partnerLabel?: string;
  estimatedReadTime: string;
}

export interface SajuCategoryItem {
  id: SajuCategoryId;
  title: string;
  subtitle: string;
  icon: string;
  themeColor: string;
  bgLightColor: string;
  description: string;
  topicsCount: number;
  highlightTag: string;
}

export const SAJU_CATEGORIES: SajuCategoryItem[] = [
  {
    id: 'nurse',
    title: '간호 사주',
    subtitle: '병동 적합도 · 듀티 난이도 · 나이트 체질',
    icon: 'heart-pulse',
    themeColor: '#FF507C', // Viva Coral Pink
    bgLightColor: '#FFF1F4',
    description: '오행과 신살(백호·귀문)을 통해 나와 가장 잘 맞는 병동과 오늘의 듀티 흐름을 분석합니다.',
    topicsCount: 4,
    highlightTag: '간호사 필수 감정',
  },
  {
    id: 'chemistry',
    title: '동료 & 대인관계',
    subtitle: '듀티 메이트 · 프리셉터 케미 · 환자 라포',
    icon: 'account-group',
    themeColor: '#10B981', // Green
    bgLightColor: '#ECFDF5',
    description: '동료 간호사와의 일진 궁합부터 프리셉터 처세술, 홍염살 기반의 환자 라포 형성력을 진단합니다.',
    topicsCount: 3,
    highlightTag: '태움 방지 & 소통',
  },
  {
    id: 'career',
    title: '이직 & 진로 대운',
    subtitle: '10년 대운 · 탈임상 타이밍 · 해외 간호사',
    icon: 'compass',
    themeColor: '#3B82F6', // Blue
    bgLightColor: '#EFF6FF',
    description: '만세력 대운수(大運數)를 통해 상급종합병원 이직, NCLEX 미국 진출, 대학원 진학의 최적기를 짚어냅니다.',
    topicsCount: 3,
    highlightTag: '10년 대운 정밀 판정',
  },
  {
    id: 'love',
    title: '연애 & 결혼 궁합',
    subtitle: '3교대 배려 배우자 · 오행 상생 궁합',
    icon: 'heart',
    themeColor: '#8B5CF6', // Purple
    bgLightColor: '#F5F3FF',
    description: '불규칙한 교대근무의 피로를 치유해 줄 천생연분 배우자상과 연인과의 성격 충돌 해결책을 제시합니다.',
    topicsCount: 2,
    highlightTag: '심층 사주 궁합',
  },
  {
    id: 'wealth',
    title: '재물 & 맞춤 재테크',
    subtitle: '사주 기반 재테크 전략 · 부동산 문서운',
    icon: 'cash-multiple',
    themeColor: '#F59E0B', // Amber
    bgLightColor: '#FFFBEB',
    description: '사주 내 정재(正財)와 편재(偏財)를 분석하여 타고난 재물 그릇과 최적의 맞춤 자산 증식 로드맵을 설계합니다.',
    topicsCount: 2,
    highlightTag: '맞춤 자산 설계',
  },
];

export const SAJU_TOPICS: Record<SajuCategoryId, SajuTopicItem[]> = {
  nurse: [
    {
      id: 'ward_fit',
      categoryId: 'nurse',
      title: '간호 & 병동 적합도 심층 판정',
      subtitle: 'ER · ICU · 병동 · OR · 외래 중 내 천직 부서는?',
      badge: '인기 1위',
      badgeColor: '#FF507C',
      tags: ['#백호대살', '#귀문관살', '#오행적성'],
      description: '사주의 일간 오행과 강약, 백호·괴강살 유무를 통해 가장 번아웃 없이 승승장구할 병동 부서를 짚어냅니다.',
      estimatedReadTime: '약 4분 읽기 (1,500자+)',
    },
    {
      id: 'hospital_fengshui',
      categoryId: 'nurse',
      title: '직장 오행 궁합 & 병원 풍수',
      subtitle: '빅5 상급종합 vs 전문병원 vs 공공의료원 궁합',
      badge: '추천',
      badgeColor: '#10B981',
      tags: ['#용신궁합', '#병원규모', '#방위풍수'],
      description: '내 사주에 부족한 기운을 채워줄 최적의 병원 규모와 지리적 방위(동서남북) 풍수 적합도를 분석합니다.',
      estimatedReadTime: '약 3분 읽기 (1,300자+)',
    },
    {
      id: 'duty_difficulty',
      categoryId: 'nurse',
      title: '오늘의 업무 난이도 & 3교대 운세',
      subtitle: '칼퇴 가능성 · 투약 사고 주의보 · 돌발 이벤트',
      badge: '매일 조회',
      badgeColor: '#3B82F6',
      tags: ['#오늘의일진', '#오버타임예측', '#처치성공률'],
      description: '오늘의 일진(日辰)과 내 사주의 상생상극을 분석하여 인수인계 난이도와 투약 주의 시각을 직언합니다.',
      estimatedReadTime: '약 3분 읽기 (1,200자+)',
    },
    {
      id: 'night_shift_biorhythm',
      categoryId: 'nurse',
      title: '나이트 / 3교대 적응 체질 & 생체 리듬',
      subtitle: '수(水)·화(火) 조후 균형과 야간 집중력 분석',
      badge: '건강 특화',
      badgeColor: '#8B5CF6',
      tags: ['#조후용신', '#수면위생', '#간신장건강'],
      description: '사주의 차고 뜨거운 기운(조후)을 바탕으로 나이트 근무 후 신체 회복 속도와 필수 영양 처방을 조언합니다.',
      estimatedReadTime: '약 3분 읽기 (1,300자+)',
    },
  ],
  chemistry: [
    {
      id: 'colleague_chemistry',
      categoryId: 'chemistry',
      title: '간호 동료와의 궁합 (듀티 메이트)',
      subtitle: '손발 척척 콤비 vs 사소한 오해 유발 관계 판정',
      badge: '동료 케미',
      badgeColor: '#10B981',
      tags: ['#원진살체크', '#천간삼합', '#인수인계호흡'],
      description: '동료의 생년월일과 나의 사주를 대조하여 듀티표에서 함께 일할 때 시너지와 갈등 주의점을 분석합니다.',
      requiresPartner: true,
      partnerType: 'colleague',
      partnerLabel: '동료 간호사 정보 입력',
      estimatedReadTime: '약 4분 읽기 (1,400자+)',
    },
    {
      id: 'preceptor_chemistry',
      categoryId: 'chemistry',
      title: '프리셉터 / 차지 간호사 케미 & 소통법',
      subtitle: '십신(관성·인성)으로 풀어보는 윗년차 공략 처세술',
      badge: '처세 비책',
      badgeColor: '#F59E0B',
      tags: ['#관인상생', '#태움방지', '#피드백수용법'],
      description: '프리셉터의 성향을 파악하고 꾸중을 칭찬으로 바꾸는 50년 명리학자의 지혜로운 임상 소통 비책.',
      requiresPartner: true,
      partnerType: 'preceptor',
      partnerLabel: '프리셉터 / 차지 간호사 정보 입력',
      estimatedReadTime: '약 4분 읽기 (1,400자+)',
    },
    {
      id: 'patient_rapport',
      categoryId: 'chemistry',
      title: '환자 & 보호자 라포 (홍염·도화살 감정노동)',
      subtitle: '컴플레인을 잠재우는 온화한 매력과 마음의 방패',
      badge: '감정 케어',
      badgeColor: '#FF507C',
      tags: ['#홍염살', '#도화살', '#감정노동번아웃'],
      description: '환자와 보호자가 나에게 호감을 느끼는 포인트와, 무리한 요구에 감정이 닳지 않도록 선을 긋는 법.',
      estimatedReadTime: '약 3분 읽기 (1,300자+)',
    },
  ],
  career: [
    {
      id: 'ten_year_daewoon',
      categoryId: 'career',
      title: '10년 대운(大運) 흐름 & 이직/퇴사 타이밍',
      subtitle: '사직서를 던지기 전 반드시 확인해야 할 운로',
      badge: '인생 분기점',
      badgeColor: '#3B82F6',
      tags: ['#대운수', '#세운변곡점', '#이직성공률'],
      description: '10년 주기 대운의 변화와 올해 세운(歲運)을 정밀 분석하여 사직, 이직, 탈임상의 성공 확률을 직언합니다.',
      estimatedReadTime: '약 5분 읽기 (1,600자+)',
    },
    {
      id: 'apn_grad_school',
      categoryId: 'career',
      title: '전문간호사(APN) & 대학원 진학 적성',
      subtitle: '화개살(華蓋)과 인성(印星)으로 보는 학업운',
      badge: '커리어 도약',
      badgeColor: '#8B5CF6',
      tags: ['#화개살', '#정인편인', '#학위논문운'],
      description: '임상 실무를 넘어 전담간호사(PA), 감염관리, 마취, 임상 전문간호사 및 연구직 진출 가능성을 진단합니다.',
      estimatedReadTime: '약 3분 읽기 (1,300자+)',
    },
    {
      id: 'overseas_nurse',
      categoryId: 'career',
      title: '해외 간호사(NCLEX, 미국/호주) 진출 대운',
      subtitle: '역마살(驛馬)과 편재(偏財)로 보는 글로벌 비전',
      badge: '글로벌 도전',
      badgeColor: '#10B981',
      tags: ['#역마살', '#해외이민운', '#영주권스폰서'],
      description: '한국을 떠나 해외 병원(미국, 호주, 중동)에서 근무했을 때 명예와 자산이 크게 불어날 사주인지 판정합니다.',
      estimatedReadTime: '약 4분 읽기 (1,400자+)',
    },
  ],
  love: [
    {
      id: 'life_partner',
      categoryId: 'love',
      title: '3교대 이해심 높은 평생 인연 & 배우자운',
      subtitle: '일지 배우자궁과 관성·재성으로 보는 배필 상',
      badge: '평생 인연',
      badgeColor: '#FF507C',
      tags: ['#배우자궁', '#정관정재', '#결혼시기'],
      description: '불규칙한 수면과 주말 근무를 든든하게 지지해 주고 안정적인 가정을 꾸려나갈 최상의 배우자 특징을 짚어냅니다.',
      estimatedReadTime: '약 4분 읽기 (1,500자+)',
    },
    {
      id: 'relationship_harmony',
      categoryId: 'love',
      title: '연인 / 썸남과의 오행 궁합 & 성격 충돌 처방',
      subtitle: '두 사람의 사주 원국 대조 및 심리 소통 가이드',
      badge: '정밀 궁합',
      badgeColor: '#8B5CF6',
      tags: ['#천생연분', '#합충변화', '#서운함해소'],
      description: '상대방의 사주와 내 사주의 음양오행 상생상극을 분석하여 잦은 다툼의 원인과 맞춤 화해법을 제시합니다.',
      requiresPartner: true,
      partnerType: 'partner',
      partnerLabel: '연인 / 상대방 정보 입력',
      estimatedReadTime: '약 4분 읽기 (1,500자+)',
    },
  ],
  wealth: [
    {
      id: 'custom_wealth_strategy',
      categoryId: 'wealth',
      title: '내 사주 기반 맞춤 재테크 전략',
      subtitle: '타고난 재물 그릇(정재·편재)과 자산 증식 로드맵',
      badge: '재물 그릇',
      badgeColor: '#F59E0B',
      tags: ['#재물선천성', '#소비성향진단', '#자산증식전략'],
      description: '사주 내 재성(財星)과 식상(食傷)의 흐름을 분석하여, 내가 돈을 모으는 체질인지 불리는 체질인지 진단하고 맞춤 투자/저축 포트폴리오를 설계합니다.',
      estimatedReadTime: '약 4분 읽기 (1,500자+)',
    },
    {
      id: 'real_estate_luck',
      categoryId: 'wealth',
      title: '부동산 / 아파트 청약 / 문서운(印星) 분석',
      subtitle: '내 집 마련과 독립의 길일(吉日) 판정',
      badge: '문서 길일',
      badgeColor: '#10B981',
      tags: ['#인성문서', '#청약당첨운', '#독립이사운'],
      description: '사주 내 인성(印星)의 힘을 바탕으로 청약 당첨운, 전월세 독립 시기, 부동산 취득의 길한 시기를 직언합니다.',
      estimatedReadTime: '약 3분 읽기 (1,300자+)',
    },
  ],
};

