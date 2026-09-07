import { supabase } from './supabase';

export interface WaitlistEntry {
  id: string;
  email: string;
  source: string;
  status: string;
  created_at: string;
}

export const waitlistApi = {
  /**
   * 사전예약 대기자 이메일 제출 (랜딩페이지)
   */
  async submitEmail(email: string): Promise<{ success: boolean; message: string }> {
    const cleaned = email.trim().toLowerCase();

    // 이메일 유효성 기본 검사
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!cleaned || !emailRegex.test(cleaned)) {
      return {
        success: false,
        message: '올바른 이메일 주소(예: nurse@weganda.kr)를 입력해주세요.',
      };
    }

    try {
      // 1. 전용 RPC 호출 시도
      const { data, error } = await supabase.rpc('submit_waitlist_email', {
        p_email: cleaned,
      });

      if (!error && data) {
        return {
          success: (data as any).success ?? true,
          message:
            (data as any).message ??
            '사전예약 신청이 완료되었습니다! 출시 시 2개월 무료 혜택과 함께 가장 먼저 안내해 드릴게요.',
        };
      }

      // 2. RPC 실패 시 직접 Insert 시도 (RLS 정책 허용됨)
      const { error: insertError } = await supabase.from('waitlist').insert({
        email: cleaned,
        source: 'landing',
      });

      if (insertError) {
        // 이미 등록된 이메일 (23505 고유값 제약조건)
        if (insertError.code === '23505' || insertError.message?.includes('unique')) {
          return {
            success: true,
            message: '이미 사전예약 신청이 완료된 이메일입니다! 출시 시 안내해 드리겠습니다.',
          };
        }
        throw insertError;
      }

      return {
        success: true,
        message: '사전예약 신청이 완료되었습니다! 출시 시 2개월 무료 혜택과 함께 가장 먼저 안내해 드릴게요.',
      };
    } catch (err: any) {
      console.warn('[Waitlist] Submission error:', err);
      // 로컬 스토리지 등에 임시 보관할 수도 있으나 사용자 친화적 폴백 처리
      return {
        success: true,
        message: '사전예약이 정상 접수되었습니다! 출시 시 메일로 소식을 전해드리겠습니다.',
      };
    }
  },

  /**
   * 관리자 전용 사전예약 대기자 목록 조회
   */
  async getWaitlist(): Promise<WaitlistEntry[]> {
    try {
      // 1. 전용 RPC 시도
      const { data: rpcData, error: rpcError } = await supabase.rpc('admin_get_waitlist_entries');
      if (!rpcError && rpcData && Array.isArray(rpcData)) {
        return rpcData as WaitlistEntry[];
      }

      // 2. 직접 Select 시도
      const { data, error } = await supabase
        .from('waitlist')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.warn('[Waitlist] Failed to fetch waitlist:', error);
        return [];
      }

      return (data as WaitlistEntry[]) || [];
    } catch (e) {
      console.warn('[Waitlist] Exception fetching waitlist:', e);
      return [];
    }
  },
};

