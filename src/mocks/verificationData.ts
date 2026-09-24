import { VerificationRequest } from '../types/verification';

/**
 * 실서버 Supabase 연동으로 인해 관리자 및 인증 모의 데이터는 모두 제거되었습니다.
 * 모든 데이터는 Supabase public.verification_requests 테이블에서 직접 실시간 조회됩니다.
 */
export const MOCK_VERIFICATION_REQUESTS: VerificationRequest[] = [];
