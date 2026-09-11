import { supabase } from './supabase';
import {
  SupportInquiry,
  SupportReply,
  CreateInquiryDTO,
  CreateReplyDTO,
  InquiryStatus,
} from '../types/support';

// 초기 샘플 목 데이터 (네트워크 지연 또는 로컬 환경용)
export const INITIAL_MOCK_INQUIRIES: SupportInquiry[] = [
  {
    id: 'inq-sample-1',
    userId: 'user-sample-01',
    userEmail: 'nurse_lee@hospital.com',
    userName: '김간호',
    category: '멤버십 관련 문의',
    title: 'weganda+ 7일 무료체험 종료일 확인 문의',
    content:
      '안녕하세요! 7일 무료체험 시작했는데 언제까지 해지해야 자동결제가 안 되는지 정확한 날짜가 궁금합니다.',
    images: [],
    status: 'resolved',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 18).toISOString(),
    replies: [
      {
        id: 'rep-sample-1',
        inquiryId: 'inq-sample-1',
        authorName: '우간다 고객지원팀',
        content:
          '안녕하세요, 간호사님! 우간다 고객센터입니다.\n무료 체험 시작일로부터 7일째 되는 날의 24시간 전까지 마이페이지 또는 스토어(Apple/Google) 구독 설정에서 [구독 취소]를 진행하시면 요금이 전혀 발생하지 않습니다. 편안하게 이용해 보시고 궁금한 점은 언제든 문의주세요!',
        isAdmin: true,
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 18).toISOString(),
      },
    ],
  },
  {
    id: 'inq-sample-2',
    userId: 'user-sample-02',
    userEmail: 'park_rn@snu.ac.kr',
    userName: '박RN',
    category: '서비스 문의',
    title: '동기 듀티 연동 인원 추가 요청',
    content:
      '병동 동기 4명과 함께 근무표를 공유하고 싶은데 무료 버전에서는 3명까지만 가능한가요?',
    images: [],
    status: 'pending',
    createdAt: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
    replies: [],
  },
];

class SupportApiService {
  // 사용자의 문의 내역 조회
  async getUserInquiries(userEmail?: string, userId?: string): Promise<SupportInquiry[]> {
    try {
      let query = supabase
        .from('inquiries')
        .select(`
          *,
          replies:inquiry_replies(*)
        `)
        .order('created_at', { ascending: false });

      if (userId) {
        query = query.or(`user_id.eq.${userId},user_email.eq.${userEmail || ''}`);
      } else if (userEmail) {
        query = query.eq('user_email', userEmail);
      }

      const { data, error } = await query;
      if (error || !data) {
        console.warn('Supabase fetch inquiries failed, returning mock data:', error);
        return INITIAL_MOCK_INQUIRIES;
      }

      return data.map(this.mapInquiryRow);
    } catch (e) {
      console.warn('Exception in getUserInquiries:', e);
      return INITIAL_MOCK_INQUIRIES;
    }
  }

  // 관리자용 전체 문의 내역 조회
  async getAllInquiries(): Promise<SupportInquiry[]> {
    try {
      const { data, error } = await supabase
        .from('inquiries')
        .select(`
          *,
          replies:inquiry_replies(*)
        `)
        .order('created_at', { ascending: false });

      if (error || !data) {
        console.warn('Supabase fetch all inquiries failed:', error);
        return INITIAL_MOCK_INQUIRIES;
      }

      return data.map(this.mapInquiryRow);
    } catch (e) {
      console.warn('Exception in getAllInquiries:', e);
      return INITIAL_MOCK_INQUIRIES;
    }
  }

  // 1:1 문의 작성
  async createInquiry(
    dto: CreateInquiryDTO,
    userId?: string,
    userEmail?: string,
    userName?: string
  ): Promise<SupportInquiry> {
    const email = dto.userEmail || userEmail || 'guest@weganda.kr';
    const name = dto.userName || userName || '간호사 회원';

    const insertPayload = {
      user_id: userId || null,
      user_email: email,
      user_name: name,
      category: dto.category,
      title: dto.title,
      content: dto.content,
      images: dto.images || [],
      status: 'pending',
    };

    try {
      const { data, error } = await supabase
        .from('inquiries')
        .insert([insertPayload])
        .select()
        .single();

      if (error || !data) {
        console.warn('Supabase insert inquiry failed, returning mock record:', error);
        return {
          id: `inq-${Date.now()}`,
          userId,
          userEmail: email,
          userName: name,
          category: dto.category,
          title: dto.title,
          content: dto.content,
          images: dto.images || [],
          status: 'pending',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          replies: [],
        };
      }

      return this.mapInquiryRow(data);
    } catch (e) {
      console.warn('Exception in createInquiry:', e);
      return {
        id: `inq-${Date.now()}`,
        userId,
        userEmail: email,
        userName: name,
        category: dto.category,
        title: dto.title,
        content: dto.content,
        images: dto.images || [],
        status: 'pending',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        replies: [],
      };
    }
  }

  // 문의에 답변(답글) 작성 (관리자 또는 사용자)
  async replyInquiry(
    dto: CreateReplyDTO,
    userId?: string,
    authorName?: string,
    isAdmin = false
  ): Promise<SupportReply> {
    const author = dto.authorName || authorName || (isAdmin ? '우간다 고객지원팀' : '작성자');

    const payload = {
      inquiry_id: dto.inquiryId,
      user_id: userId || null,
      author_name: author,
      content: dto.content,
      is_admin: isAdmin,
    };

    try {
      const { data, error } = await supabase
        .from('inquiry_replies')
        .insert([payload])
        .select()
        .single();

      // 관리자가 답글 작성 시 자동으로 상태를 'resolved'로 업데이트
      if (isAdmin) {
        await this.updateInquiryStatus(dto.inquiryId, 'resolved');
      }

      if (error || !data) {
        return {
          id: `rep-${Date.now()}`,
          inquiryId: dto.inquiryId,
          userId,
          authorName: author,
          content: dto.content,
          isAdmin,
          createdAt: new Date().toISOString(),
        };
      }

      return {
        id: data.id,
        inquiryId: data.inquiry_id,
        userId: data.user_id,
        authorName: data.author_name,
        content: data.content,
        isAdmin: data.is_admin,
        createdAt: data.created_at,
      };
    } catch (e) {
      console.warn('Exception in replyInquiry:', e);
      return {
        id: `rep-${Date.now()}`,
        inquiryId: dto.inquiryId,
        userId,
        authorName: author,
        content: dto.content,
        isAdmin,
        createdAt: new Date().toISOString(),
      };
    }
  }

  // 문의 상태 변경 ('pending' | 'resolved')
  async updateInquiryStatus(id: string, status: InquiryStatus): Promise<void> {
    try {
      await supabase
        .from('inquiries')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('id', id);
    } catch (e) {
      console.warn('Exception in updateInquiryStatus:', e);
    }
  }

  private mapInquiryRow(row: any): SupportInquiry {
    return {
      id: row.id,
      userId: row.user_id,
      userEmail: row.user_email,
      userName: row.user_name,
      category: row.category,
      title: row.title,
      content: row.content,
      images: Array.isArray(row.images) ? row.images : [],
      status: row.status as InquiryStatus,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      replies: (row.replies || []).map((r: any) => ({
        id: r.id,
        inquiryId: r.inquiry_id,
        userId: r.user_id,
        authorName: r.author_name,
        content: r.content,
        isAdmin: r.is_admin,
        createdAt: r.created_at,
      })),
    };
  }
}

export const supportApi = new SupportApiService();
