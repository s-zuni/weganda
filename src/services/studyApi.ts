import { supabase } from './supabase';
import { withClockSkewRetry } from '../utils/supabaseRetry';

export interface StudyGuideDbItem {
  id: string;
  category: string;
  title: string;
  summary: string;
  content: string;
  readTime?: string;
  icon?: string;
  isNew?: boolean;
  sortOrder?: number;
  createdAt?: string;
}

export const studyApi = {
  // 지침서 목록 조회 (카테고리별 필터 지원)
  async getStudyGuides(category?: string): Promise<StudyGuideDbItem[]> {
    return withClockSkewRetry(async () => {
      let query = supabase
        .from('study_guides')
        .select('*')
        .order('sort_order', { ascending: true });

      if (category && category !== '전체' && category !== '북마크 보관함') {
        query = query.eq('category', category);
      }

      const { data, error } = await query;

      if (error) {
        console.warn('Error fetching study guides from DB:', error);
        return [];
      }

      return (data || []).map((row) => ({
        id: row.id,
        category: row.category,
        title: row.title,
        summary: row.summary,
        content: row.content,
        readTime: row.read_time || '3분',
        icon: row.icon || 'book',
        isNew: row.is_new ?? false,
        sortOrder: row.sort_order ?? 0,
        createdAt: row.created_at,
      }));
    });
  },

  // 특정 지침서 상세 조회
  async getStudyGuideById(id: string): Promise<StudyGuideDbItem | null> {
    return withClockSkewRetry(async () => {
      const { data, error } = await supabase
        .from('study_guides')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        console.warn('Error fetching study guide by id:', error);
        return null;
      }

      return {
        id: data.id,
        category: data.category,
        title: data.title,
        summary: data.summary,
        content: data.content,
        readTime: data.read_time || '3분',
        icon: data.icon || 'book',
        isNew: data.is_new ?? false,
        sortOrder: data.sort_order ?? 0,
        createdAt: data.created_at,
      };
    });
  },
};

