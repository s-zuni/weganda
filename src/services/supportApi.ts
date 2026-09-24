import { supabase } from './supabase';
import {
  SupportInquiry,
  SupportReply,
  CreateInquiryDTO,
  CreateReplyDTO,
  InquiryStatus,
} from '../types/support';

// 초기 샘플 목 데이터 제거 (실제 Supabase inquiries 테이블에서만 조회)
export const INITIAL_MOCK_INQUIRIES: SupportInquiry[] = [];

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
        return [];
      }

      return data.map(this.mapInquiryRow);
    } catch (e) {
      console.warn('Exception in getAllInquiries:', e);
      return [];
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

