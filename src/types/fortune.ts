// ─── 오행 및 간호 사주 데이터 ─────────────────────

export interface ElementRatio {
  element: '목(木)' | '화(火)' | '토(土)' | '금(金)' | '수(水)';
  percentage: number;
  color: string;
  desc: string;
}

export interface WardCompatibility {
  rank: number;
  ward: string;
  score: number;
  badge: string;
  reason: string;
}

export interface NurseDutyDifficulty {
  category: string;
  score: number; // 0 ~ 100
  status: '좋음' | '보통' | '주의' | '최고';
  comment: string;
}

// ─── 애정운 ────────────────────────────────────

export interface LoveFortuneData {
  coupleScore: number;
  sajuCompatibility: string;
  mbtiSolution: {
    userMbti: string;
    partnerMbti: string;
    chemistry: string;
    solution: string;
  };
  crushTimeline: {
    timing: string;
    action: string;
    strategy: string;
  }[];
  marriageAdvice: {
    pros: string[];
    cautions: string[];
    score: number;
  };
}

// ─── 직업운 ────────────────────────────────────

export interface CareerFortuneData {
  tenYearGreatFlow: { year: number; score: number; label: string }[];
  transferHospitals: {
    hospital: string;
    matchScore: number;
    timing: string;
    advantage: string;
  }[];
  colleagueChemistry: {
    name: string;
    dutyRole: string;
    chemistryScore: number;
    comment: string;
  }[];
}

// ─── 금전운 ────────────────────────────────────

export interface WealthFortuneData {
  wealthTendency: {
    trait: string;
    score: number;
    description: string;
  }[];
  investmentPortfolio: {
    asset: string;
    ratio: number;
    color: string;
    recommendation: string;
  }[];
  wealthTimeline: {
    period: string;
    type: '유입(입금)' | '지출(유출)' | '성장';
    amount: string;
    guide: string;
  }[];
}

// ─── 사주 12지시 ────────────────────────────────

export interface SajuTimeSlot {
  code: string;
  name: string;
  hanja: string;
  range: string;
  representativeTime: string;
}

// ─── 사주 입력 정보 ────────────────────────────

export interface BirthInfo {
  birthDate: string; // YYYY-MM-DD
  birthTime: string; // HH:mm or '미상'
  calendarType: 'solar' | 'lunar';
  gender: 'female' | 'male';
  isRegistered: boolean;
}

export interface PartnerInfo {
  birthDate: string;
  birthTime: string;
  mbti: string;
}

export interface ColleagueInfo {
  name: string;
  birthDate: string;
  birthTime: string;
}

export type SubFortuneType = 'saju' | 'love' | 'career' | 'wealth';

