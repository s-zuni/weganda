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
    title: '근무 적합도',
    subtitle: '병동 적합도 · 듀티 난이도 · 교대 적응도',
    icon: 'heart-pulse',
    themeColor: '#FF507C', // Viva Coral Pink
    bgLightColor: '#FFF1F4',
    description: '업무 기질과 생체 리듬 분석을 통해 나와 가장 잘 맞는 병동과 오늘의 듀티 흐름을 분석합니다.',
    topicsCount: 4,
    highlightTag: '교대근무 적응도',
  },
  {
    id: 'chemistry',
    title: '동료 & 대인관계',
    subtitle: '듀티 메이트 · 프리셉터 소통 · 환자 라포',
    icon: 'account-group',
    themeColor: '#10B981', // Green
    bgLightColor: '#ECFDF5',
    description: '동료와의 협업 스타일, 듀티 메이트 소통, 부서 내 원활한 협력 방안을 진단합니다.',
    topicsCount: 3,
    highlightTag: '협업 & 소통 케어',
  },
  {
    id: 'career',
    title: '이직 & 진로 분석',
    subtitle: '커리어 로드맵 · 자기계발 · 해외 진출',
    icon: 'compass',
    themeColor: '#3B82F6', // Blue
    bgLightColor: '#EFF6FF',
    description: '경력 성장 주기 분석을 통해 상급종합병원 이직, 해외 진출, 대학원 진학의 최적기를 분석합니다.',
    topicsCount: 3,
    highlightTag: '커리어 로드맵',
  },
  {
    id: 'love',
    title: '라이프 & 관계 밸런스',
    subtitle: '3교대 배려 라이프 · 소통 성향 진단',
    icon: 'heart',
    themeColor: '#8B5CF6', // Purple
    bgLightColor: '#F5F3FF',
    description: '불규칙한 교대근무의 피로를 덜고 일과 삶의 균형을 맞추는 소통 솔루션을 제시합니다.',
    topicsCount: 2,
    highlightTag: '관계 밸런스',
  },
  {
    id: 'wealth',
    title: '수당 & 자산 관리',
    subtitle: '야간 수당 모으기 · 소비 성향 진단',
    icon: 'cash-multiple',
    themeColor: '#F59E0B', // Amber
    bgLightColor: '#FFFBEB',
    description: '야간/휴일 수당과 소비 성향을 분석하여 효과적인 자산 관리 방향을 조언합니다.',
    topicsCount: 2,
    highlightTag: '수당 자산 관리',
  },
];

export const SAJU_TOPICS: Record<SajuCategoryId, SajuTopicItem[]> = {
  nurse: [
    {
      id: 'ward_fit',
      categoryId: 'nurse',
      title: '간호 & 부서 적합도 심층 분석',
      subtitle: 'ER · ICU · 병동 · OR · 외래 중 내 성향에 맞는 부서는?',
      badge: '인기 1위',
      badgeColor: '#FF507C',
      tags: ['#업무기질', '#스트레스관리', '#적성분석'],
      description: '업무 기질과 성향, 집중력 패턴을 통해 가장 안정적으로 몰입할 수 있는 병동 부서를 진단합니다.',
      estimatedReadTime: '약 4분 읽기 (1,500자+)',
    },
    {
      id: 'hospital_fengshui',
      categoryId: 'nurse',
      title: '기관 규모 & 근무 환경 적합도',
      subtitle: '빅5 상급종합 vs 전문병원 vs 공공의료원 환경 분석',
      badge: '추천',
      badgeColor: '#10B981',
      tags: ['#환경적성', '#병원규모', '#근무스타일'],
      description: '내 업무 스타일과 에너지에 가장 잘 맞는 병원 규모와 근무 환경 특성을 분석합니다.',
      estimatedReadTime: '약 3분 읽기 (1,300자+)',
    },
    {
      id: 'duty_difficulty',
      categoryId: 'nurse',
      title: '오늘의 듀티 컨디션 & 업무 리듬',
      subtitle: '칼퇴 가능성 · 집중 주의 구간 · 업무 돌발 변수',
      badge: '매일 조회',
      badgeColor: '#3B82F6',
      tags: ['#데일리리듬', '#집중도예측', '#컨디션체크'],
      description: '오늘의 바이오리듬과 기질 특성을 분석하여 인수인계 및 주요 업무 시 집중할 타이밍을 조언합니다.',
      estimatedReadTime: '약 3분 읽기 (1,200자+)',
    },
    {
      id: 'night_shift_biorhythm',
      categoryId: 'nurse',
      title: '교대근무 적응 체질 & 수면 리듬',
      subtitle: '생체 리듬 밸런스와 야간 집중력 분석',
      badge: '건강 특화',
      badgeColor: '#8B5CF6',
      tags: ['#생체리듬', '#수면위생', '#피로회복'],
      description: '개인 생체 리듬 특성을 바탕으로 야간 교대근무 후 신체 회복 속도와 휴식 가이드를 조언합니다.',
      estimatedReadTime: '약 3분 읽기 (1,300자+)',
    },
  ],
  chemistry: [
    {
      id: 'colleague_chemistry',
      categoryId: 'chemistry',
      title: '간호 동료와의 협업 케미 (듀티 메이트)',
      subtitle: '손발 척척 콤비 vs 사소한 오해 방지 소통법',
      badge: '동료 케미',
      badgeColor: '#10B981',
      tags: ['#소통스타일', '#업무시너지', '#인수인계호흡'],
      description: '동료의 업무 스타일과 내 성향을 대조하여 함께 일할 때의 시너지와 협업 포인트를 분석합니다.',
      requiresPartner: true,
      partnerType: 'colleague',
      partnerLabel: '동료 정보 입력',
      estimatedReadTime: '약 4분 읽기 (1,400자+)',
    },
    {
      id: 'preceptor_chemistry',
      categoryId: 'chemistry',
      title: '선후배 & 프리셉터 소통 솔루션',
      subtitle: '성향으로 풀어보는 지혜로운 업무 소통법',
      badge: '소통 비책',
      badgeColor: '#F59E0B',
      tags: ['#피드백소통', '#관계케어', '#적응전략'],
      description: '선배와 후배 간 상호 성향을 이해하고 긍정적인 피드백을 주고받는 임상 소통 가이드를 제공합니다.',
      requiresPartner: true,
      partnerType: 'preceptor',
      partnerLabel: '선배 / 프리셉터 정보 입력',
      estimatedReadTime: '약 4분 읽기 (1,400자+)',
    },
    {
      id: 'patient_rapport',
      categoryId: 'chemistry',
      title: '환자 & 보호자 라포 형성 및 감정 케어',
      subtitle: '따뜻한 라포 형성과 내 마음을 지키는 소통법',
      badge: '감정 케어',
      badgeColor: '#FF507C',
      tags: ['#라포형성', '#경청소통', '#감정노동케어'],
      description: '환자와 보호자와 신뢰를 쌓는 소통 팁과 무리한 요구에 감정이 소진되지 않는 마음 방패를 제시합니다.',
      estimatedReadTime: '약 3분 읽기 (1,300자+)',
    },
  ],
  career: [
    {
      id: 'ten_year_daewoon',
      categoryId: 'career',
      title: '커리어 주기 흐름 & 이직 타이밍',
      subtitle: '중요한 진로 결정을 내리기 전 확인하는 경력 주기',
      badge: '인생 분기점',
      badgeColor: '#3B82F6',
      tags: ['#경력주기', '#이직준비', '#커리어전환'],
      description: '중장기 경력 발전 주기와 올해 흐름을 분석하여 이직, 진로 전환, 전문성 강화의 최적 타이밍을 분석합니다.',
      estimatedReadTime: '약 5분 읽기 (1,600자+)',
    },
    {
      id: 'apn_grad_school',
      categoryId: 'career',
      title: '전문간호사(APN) & 대학원 진학 분석',
      subtitle: '학업 적성과 연구·전문직 진출 로드맵',
      badge: '커리어 도약',
      badgeColor: '#8B5CF6',
      tags: ['#자기계발', '#전문성강화', '#학위진학'],
      description: '임상 실무를 넘어 전담간호사(PA), 감염관리, 마취, 임상 전문간호사 및 연구직 진출 가능성을 진단합니다.',
      estimatedReadTime: '약 3분 읽기 (1,300자+)',
    },
    {
      id: 'overseas_nurse',
      categoryId: 'career',
      title: '해외 간호사(NCLEX, 미국/호주) 진출 분석',
      subtitle: '글로벌 도전과 해외 근무 적합도',
      badge: '글로벌 도전',
      badgeColor: '#10B981',
      tags: ['#해외진출', '#글로벌도전', '#커리어확장'],
      description: '해외 의료기관(미국, 호주 등) 진출 시의 적응도와 전문성 성장 잠재력을 분석합니다.',
      estimatedReadTime: '약 4분 읽기 (1,400자+)',
    },
  ],
  love: [
    {
      id: 'life_partner',
      categoryId: 'love',
      title: '3교대 라이프 이해와 소중한 인연',
      subtitle: '불규칙한 교대근무를 서로 배려하는 동반자 성향',
      badge: '관계 밸런스',
      badgeColor: '#FF507C',
      tags: ['#관계배려', '#상호이해', '#안정된일상'],
      description: '불규칙한 수면과 주말 근무를 든든하게 지지해 주고 안정적인 일상을 함께할 최적의 관계 특성을 조언합니다.',
      estimatedReadTime: '약 4분 읽기 (1,500자+)',
    },
    {
      id: 'relationship_harmony',
      categoryId: 'love',
      title: '성격 성향 분석 & 소통 갈등 해결',
      subtitle: '서로 다른 소통 패턴 이해와 관계 회복 가이드',
      badge: '소통 가이드',
      badgeColor: '#8B5CF6',
      tags: ['#상호성향', '#소통방식', '#갈등해소'],
      description: '상대방과 나의 성향 차이를 분석하여 잦은 다툼의 원인과 원활한 대화 방식을 제시합니다.',
      requiresPartner: true,
      partnerType: 'partner',
      partnerLabel: '상대방 정보 입력',
      estimatedReadTime: '약 4분 읽기 (1,500자+)',
    },
  ],
  wealth: [
    {
      id: 'night_allowance_wealth',
      categoryId: 'wealth',
      title: '수당 기반 맞춤 재테크 & 자산 관리',
      subtitle: '안정 저축형 vs 성장 투자형 맞춤 포트폴리오',
      badge: '자산 관리',
      badgeColor: '#F59E0B',
      tags: ['#수당관리', '#목돈만들기', '#저축습관'],
      description: '소중한 야간 수당과 상여금을 효과적으로 불려나가는 자산 배분 원칙을 조언합니다.',
      estimatedReadTime: '약 3분 읽기 (1,300자+)',
    },
    {
      id: 'real_estate_luck',
      categoryId: 'wealth',
      title: '독립 및 주거 계획 플랜 분석',
      subtitle: '내 집 마련과 독립을 위한 최적의 준비 시기',
      badge: '주거 플랜',
      badgeColor: '#10B981',
      tags: ['#주거계획', '#독립플랜', '#자산형성'],
      description: '청약 준비, 전월세 독립 시기, 주거 안정을 위한 재무 로드맵을 제안합니다.',
      estimatedReadTime: '약 3분 읽기 (1,300자+)',
    },
  ],
};
