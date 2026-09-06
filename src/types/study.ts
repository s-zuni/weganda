export type StudyCategory =
  | '약물계산/투약'
  | '응급/ACLS'
  | '간호술기'
  | '바이탈/중재'
  | '전체'
  | '북마크 보관함';

export interface StudyGuideItem {
  id: string;
  title: string;
  category: '약물계산/투약' | '응급/ACLS' | '간호술기' | '바이탈/중재';
  summary: string;
  iconType: 'flask' | 'zap' | 'activity' | 'book';
  iconBg: string;
  author: string;
  meta: string;
  views: number;
  isBookmarked: boolean;
  keyPoints: string[];
  dangerAlert?: string;
  fullContent: string[];
}

export interface DrugPreset {
  id: string;
  name: string;
  defaultDose: number; // mcg/kg/min
  unit: string;
  drugTotalMg: number;
  fluidTotalMl: number;
  description: string;
}

