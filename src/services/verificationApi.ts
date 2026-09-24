import { supabase } from './supabase';
import {
  VerificationRequest,
  VerificationSubmissionData,
  VerificationStatus,
} from '../types/verification';

export interface VerificationListResponse {
  requests: VerificationRequest[];
  totalCount: number;
  counts: {
    all: number;
    pending: number;
    verified: number;
    rejected: number;
  };
}

export const verificationApi = {
  /**
   * DB snake_case 레코드를 프론트엔드 VerificationRequest 모델로 변환
   */
  mapRow(row: any): VerificationRequest {
    return {
      id: row.id,
      userId: row.user_id,
      userName: row.user_name || '이름 없음',
      userEmail: row.user_email || undefined,
      targetRole: (row.target_role as 'nurse' | 'student') || 'nurse',
      verificationType: (row.verification_type as any) || 'license',
      hospitalOrSchool: row.organization_name || row.hospital_or_school || '',
      organizationName: row.organization_name || row.hospital_or_school || '',
      departmentOrMajor: row.department_or_major || undefined,
      licenseNumber: row.license_number || undefined,
      documentName: row.document_name || undefined,
      documentUrl: row.document_url || '',
      status: (row.status as VerificationStatus) || 'pending',
      rejectReason: row.reject_reason || undefined,
      reviewedAt: row.reviewed_at || undefined,
      submittedAt: row.created_at || new Date().toISOString(),
    };
  },

  /**
   * 사용자의 인증 신청 제출 (Supabase verification_requests 테이블에 실제 저장)
   */
  async submitVerification(
    userId: string,
    userName: string,
    userEmail: string | undefined,
    data: VerificationSubmissionData
  ): Promise<VerificationRequest> {
    const payload = {
      user_id: userId,
      user_name: userName || '간호사',
      user_email: userEmail || null,
      target_role: data.targetRole,
      verification_type: data.verificationType,
      hospital_or_school: data.organizationName || data.hospitalOrSchool || null,
      organization_name: data.organizationName || data.hospitalOrSchool || null,
      department_or_major: data.departmentOrMajor || null,
      license_number: data.licenseNumber || null,
      document_name: data.documentName || null,
      document_url: data.documentUrl || '',
      status: 'pending',
    };

    const { data: inserted, error } = await supabase
      .from('verification_requests')
      .insert(payload)
      .select()
      .single();

    if (error) {
      console.error('[verificationApi] submitVerification error:', error);
      throw error;
    }

    return this.mapRow(inserted);
  },

  /**
   * 특정 사용자의 가장 최근 인증 신청 내역 조회 (실제 Supabase 조회)
   */
  async getMyVerificationRequest(userId: string): Promise<VerificationRequest | null> {
    try {
      const { data, error } = await supabase
        .from('verification_requests')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(1);

      if (error) {
        console.error('[verificationApi] getMyVerificationRequest error:', error);
        return null;
      }

      if (!data || data.length === 0) return null;
      return this.mapRow(data[0]);
    } catch (e) {
      console.error('[verificationApi] getMyVerificationRequest exception:', e);
      return null;
    }
  },

  /**
   * 관리자: 인증 신청 목록 페이징 및 상태별 카운트 조회 (10건 단위 페이징)
   */
  async getAllRequests(params?: {
    status?: VerificationStatus | 'all';
    page?: number;
    pageSize?: number;
  }): Promise<VerificationListResponse> {
    const page = params?.page || 1;
    const pageSize = params?.pageSize || 10;
    const statusFilter = params?.status || 'pending';
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    try {
      // 1. 상태별 카운트 병렬 조회
      const [allRes, pendingRes, verifiedRes, rejectedRes] = await Promise.all([
        supabase.from('verification_requests').select('id', { count: 'exact', head: true }),
        supabase.from('verification_requests').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
        supabase.from('verification_requests').select('id', { count: 'exact', head: true }).eq('status', 'verified'),
        supabase.from('verification_requests').select('id', { count: 'exact', head: true }).eq('status', 'rejected'),
      ]);

      const counts = {
        all: allRes.count || 0,
        pending: pendingRes.count || 0,
        verified: verifiedRes.count || 0,
        rejected: rejectedRes.count || 0,
      };

      // 2. 현재 필터에 따른 데이터 쿼리
      let query = supabase
        .from('verification_requests')
        .select('*', { count: 'exact' });

      if (statusFilter !== 'all') {
        query = query.eq('status', statusFilter);
      }

      const { data, error, count } = await query
        .order('created_at', { ascending: false })
        .range(from, to);

      if (error) {
        console.error('[verificationApi] getAllRequests error:', error);
        throw error;
      }

      const requests = (data || []).map((row) => this.mapRow(row));
      const totalCount =
        count !== null
          ? count
          : statusFilter === 'all'
          ? counts.all
          : (counts as any)[statusFilter] || 0;

      return {
        requests,
        totalCount,
        counts,
      };
    } catch (e) {
      console.error('[verificationApi] getAllRequests exception:', e);
      return {
        requests: [],
        totalCount: 0,
        counts: { all: 0, pending: 0, verified: 0, rejected: 0 },
      };
    }
  },

  /**
   * 관리자: 인증 서류 승인 처리 (수락)
   * RPC admin_approve_verification_request 호출 -> 실패 시 테이블 직접 업데이트 fallback
   */
  async approveRequest(
    requestId: string,
    targetUserId?: string,
    targetRole?: 'nurse' | 'student'
  ): Promise<boolean> {
    try {
      // 1. RPC 호출 시도
      const { data, error } = await supabase.rpc('admin_approve_verification_request', {
        p_request_id: requestId,
        p_target_role: targetRole || 'nurse',
      });

      if (!error && data === true) {
        return true;
      }

      // 2. Direct Table Fallback
      const { error: updateError } = await supabase
        .from('verification_requests')
        .update({
          status: 'verified',
          reviewed_at: new Date().toISOString(),
          reject_reason: null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', requestId);

      if (updateError) {
        console.error('[verificationApi] direct approve update error:', updateError);
        return false;
      }

      // 프로필 역할도 승급
      if (targetUserId) {
        await supabase
          .from('profiles')
          .update({
            role: targetRole || 'nurse',
            updated_at: new Date().toISOString(),
          })
          .eq('id', targetUserId);
      }

      return true;
    } catch (e) {
      console.error('[verificationApi] approveRequest error:', e);
      return false;
    }
  },

  /**
   * 관리자: 인증 서류 반려 처리 (리젝 + 사유 기재)
   */
  async rejectRequest(requestId: string, reason: string): Promise<boolean> {
    try {
      // 1. RPC 호출 시도
      const { data, error } = await supabase.rpc('admin_reject_verification_request', {
        p_request_id: requestId,
        p_reason: reason,
      });

      if (!error && data === true) {
        return true;
      }

      // 2. Direct Table Fallback
      const { error: updateError } = await supabase
        .from('verification_requests')
        .update({
          status: 'rejected',
          reject_reason: reason,
          reviewed_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', requestId);

      if (updateError) {
        console.error('[verificationApi] direct reject update error:', updateError);
        return false;
      }

      return true;
    } catch (e) {
      console.error('[verificationApi] rejectRequest error:', e);
      return false;
    }
  },
};
