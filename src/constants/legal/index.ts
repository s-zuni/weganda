import { LegalDocument, LegalTabKey } from './types';
import { TERMS_OF_SERVICE } from './termsOfService';
import { PRIVACY_POLICY } from './privacyPolicy';
import { MEMBERSHIP_TERMS } from './membershipTerms';
import { COMMUNITY_TERMS } from './communityTerms';

export * from './types';
export * from './termsOfService';
export * from './privacyPolicy';
export * from './membershipTerms';
export * from './communityTerms';

export const LEGAL_DOCUMENTS: Record<LegalTabKey, LegalDocument> = {
  terms: TERMS_OF_SERVICE,
  privacy: PRIVACY_POLICY,
  membership: MEMBERSHIP_TERMS,
  community: COMMUNITY_TERMS,
};

export const LEGAL_TABS: { key: LegalTabKey; label: string; path: string }[] = [
  { key: 'terms', label: '서비스 이용약관', path: '/terms' },
  { key: 'privacy', label: '개인정보처리방침', path: '/privacy' },
  { key: 'membership', label: '우간다+ 멤버십 이용약관', path: '/membership' },
  { key: 'community', label: '커뮤니티 이용약관', path: '/community' },
];

