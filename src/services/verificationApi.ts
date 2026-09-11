import { supabase } from './supabase';
import {
  VerificationRequest,
  VerificationSubmissionData,
  VerificationStatus,
} from '../types/verification';
import { MOCK_VERIFICATION_REQUESTS } from '../mocks/verificationData';

// 메모리 상의 인증 요청 목록 (프론트엔드 퍼스트 Mock)
let memoryRequests: VerificationRequest[] = [...MOCK_VERIFICATION_REQUESTS];

export const verificationApi = {
  /**
   * 사용자의 인증 신청 제출
   */
  async submitVerification(
    userId: string,
    userName: string,
    userEmail: string | undefined,
    data: VerificationSubmissionData
  ): Promise<VerificationRequest> {
    const newRequest: VerificationRequest = {
      id: 'req-' + Date.now(),
      userId,
      userName,
      userEmail,
      targetRole: data.targetRole,
      verificationType: data.verificationType,
      hospitalOrSchool: data.organizationName || data.hospitalOrSchool || '',
      organizationName: data.organizationName || data.hospitalOrSchool || '',
      departmentOrMajor: data.departmentOrMajor,
      licenseNumber: data.licenseNumber,
      documentName: data.documentName,
      documentUrl: data.documentUrl,
      submittedAt: new Date().toISOString(),
      status: 'pending',
    };

    // 기존 요청이 있다면 교체, 없으면 추가
    const existingIdx = memoryRequests.findIndex((r) => r.userId === userId);
    if (existingIdx >= 0) {
      memoryRequests[existingIdx] = newRequest;
    } else {
      memoryRequests.unshift(newRequest);
    }

    // Supabase 테이블이 존재하면 백그라운드 싱크 시도 (실패해도 Mock 정상 반환)
    try {
      await supabase.from('verification_requests').insert({
        user_id: userId,
        target_role: data.targetRole,
        verification_type: data.verificationType,
        hospital_or_school: data.hospitalOrSchool,
        department_or_major: data.departmentOrMajor,
        document_url: data.documentUrl,
        status: 'pending',
      });
    } catch (e) {
      // Ignored for frontend-first mock
    }

    return newRequest;
  },

  /**
   * 특정 사용자의 가장 최근 인증 신청 내역 조회
   */
  async getMyVerificationRequest(userId: string): Promise<VerificationRequest | null> {
    const found = memoryRequests.find((r) => r.userId === userId);
    return found || null;
  },

  /**
   * 관리자: 전체 인증 신청 목록 조회
   */
  async getAllRequests(filterStatus?: VerificationStatus): Promise<VerificationRequest[]> {
    if (!filterStatus || filterStatus === 'none') {
      return [...memoryRequests];
    }
    return memoryRequests.filter((r) => r.status === filterStatus);
  },

  /**
   * 관리자: 인증 서류 승인 처리 (수락)
   */
  async approveRequest(requestId: string): Promise<boolean> {
    const idx = memoryRequests.findIndex((r) => r.id === requestId);
    if (idx === -1) return false;

    const req = memoryRequests[idx];
    req.status = 'verified';
    req.reviewedAt = new Date().toISOString();
    req.rejectReason = undefined;

    // Supabase 프로필 역할 갱신 시도
    try {
      await supabase
        .from('profiles')
        .update({
          role: req.targetRole,
          hospital_name: req.hospitalOrSchool,
          ward_name: req.departmentOrMajor || '',
          updated_at: new Date().toISOString(),
        })
        .eq('id', req.userId);
    } catch (e) {}

    return true;
  },

  /**
   * 관리자: 인증 서류 반려 처리 (리젝 + 사유 기재)
   */
  async rejectRequest(requestId: string, reason: string): Promise<boolean> {
    const idx = memoryRequests.findIndex((r) => r.id === requestId);
    if (idx === -1) return false;

    const req = memoryRequests[idx];
    req.status = 'rejected';
    req.reviewedAt = new Date().toISOString();
    req.rejectReason = reason;

    return true;
  },
};
