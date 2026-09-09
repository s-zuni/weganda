import { LegalDocument, LegalTabKey } from './types';
import { TERMS_OF_SERVICE } from './termsOfService';
import { PRIVACY_POLICY } from './privacyPolicy';
import { PAID_TERMS } from './paidTerms';
import { COMMUNITY_POLICY } from './communityPolicy';

export * from './types';
export * from './termsOfService';
export * from './privacyPolicy';
export * from './paidTerms';
export * from './communityPolicy';

export const LEGAL_DOCUMENTS: Record<LegalTabKey, LegalDocument> = {
  service: TERMS_OF_SERVICE,
  privacy: PRIVACY_POLICY,
  paid: PAID_TERMS,
  community: COMMUNITY_POLICY,
};

export const LEGAL_TABS: { key: LegalTabKey; label: string; path: string }[] = [
  { key: 'service', label: '서비스 이용약관', path: '/terms?tab=service' },
  { key: 'privacy', label: '개인정보 처리방침', path: '/terms?tab=privacy' },
  { key: 'paid', label: '유료서비스 및 환불규정', path: '/terms?tab=paid' },
  { key: 'community', label: '커뮤니티 운영원칙', path: '/terms?tab=community' },
];

