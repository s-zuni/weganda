export type LegalTabKey = 'service' | 'privacy' | 'paid' | 'community';

export interface LegalArticle {
  articleNumber?: string; // 예: "제1조 (목적)"
  title: string;
  paragraphs: string[];
  subList?: {
    subTitle?: string;
    items: string[];
  }[];
  highlightBox?: {
    title: string;
    description: string;
    variant?: 'info' | 'warning' | 'coral';
  };
}

export interface LegalDocument {
  id: LegalTabKey;
  title: string;
  shortTitle: string;
  effectiveDate: string; // 예: "2026년 9월 1일 시행"
  lastUpdatedDate?: string;
  version: string;
  summary: string;
  articles: LegalArticle[];
}

