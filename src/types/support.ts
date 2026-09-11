export type InquiryCategory =
  | '서비스 문의'
  | '버그 신고'
  | '멤버십 관련 문의'
  | '결제 오류'
  | '건의 사항'
  | '기타';

export type InquiryStatus = 'pending' | 'resolved';

export interface SupportReply {
  id: string;
  inquiryId: string;
  userId?: string;
  authorName: string;
  content: string;
  isAdmin: boolean;
  createdAt: string;
}

export interface SupportInquiry {
  id: string;
  userId?: string;
  userEmail: string;
  userName: string;
  category: InquiryCategory;
  title: string;
  content: string;
  images: string[];
  status: InquiryStatus;
  createdAt: string;
  updatedAt: string;
  replies?: SupportReply[];
}

export interface CreateInquiryDTO {
  category: InquiryCategory;
  title: string;
  content: string;
  images?: string[];
  userEmail?: string;
  userName?: string;
}

export interface CreateReplyDTO {
  inquiryId: string;
  content: string;
  isAdmin?: boolean;
  authorName?: string;
}

export const INQUIRY_CATEGORIES: InquiryCategory[] = [
  '서비스 문의',
  '버그 신고',
  '멤버십 관련 문의',
  '결제 오류',
  '건의 사항',
  '기타',
];

export const BUSINESS_INFO = {
  companyName: '스즈니(SZUNI)',
  businessNumber: '364-45-01374',
  representative: '이승준',
  tel: '070-8095-3075',
  email: 'buiszuni@gmail.com',
  officialServiceEmail: 'contact@weganda.kr',
  hours: '평일 09:00 ~ 18:00 (주말 및 공휴일 휴무)',
} as const;
