import { supabase } from './supabase';
import { Tables, TablesInsert } from '../types/database';

export interface PostDetailItem {
  id: string;
  authorId: string;
  authorName: string;
  authorHospital?: string;
  category: string;
  title: string;
  content: string;
  isAnonymous: boolean;
  images: string[];
  viewsCount: number;
  likesCount: number;
  commentsCount: number;
  isLiked?: boolean;
  isBookmarked?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CommentItem {
  id: string;
  postId: string;
  parentId?: string;
  authorId: string;
  authorName: string;
  authorHospital?: string;
  content: string;
  isAnonymous: boolean;
  likesCount: number;
  isLiked?: boolean;
  createdAt: string;
  replies?: CommentItem[];
}

export const communityApi = {
  // 게시글 목록 조회 (C1)
  async getPosts(params?: {
    category?: string;
    page?: number;
    pageSize?: number;
    userId?: string;
  }): Promise<PostDetailItem[]> {
    const page = params?.page || 1;
    const pageSize = params?.pageSize || 20;
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    let query = supabase
      .from('posts')
      .select(`
        id, author_id, category, title, content, is_anonymous, images,
        views_count, likes_count, comments_count, created_at, updated_at,
        profiles ( name, hospital_name )
      `)
      .eq('is_hidden', false)
      .order('created_at', { ascending: false })
      .range(from, to);

    if (params?.category && params.category !== '전체') {
      query = query.eq('category', params.category);
    }

    const { data, error } = await query;
    if (error) {
      console.error('Error fetching posts:', error);
      throw error;
    }

    return (data || []).map((row: any) => {
      const isAnon = row.is_anonymous;
      return {
        id: row.id,
        authorId: row.author_id,
        authorName: isAnon ? '익명 간호사' : (row.profiles?.name || '간호사'),
        authorHospital: isAnon ? '익명 병원' : (row.profiles?.hospital_name || '종합병원'),
        category: row.category,
        title: row.title,
        content: row.content,
        isAnonymous: isAnon,
        images: row.images || [],
        viewsCount: row.views_count || 0,
        likesCount: row.likes_count || 0,
        commentsCount: row.comments_count || 0,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
      };
    });
  },

  // 게시글 상세 조회 + 조회수 증가 (C2, C10)
  async getPostDetail(postId: string, currentUserId?: string): Promise<PostDetailItem | null> {
    // 조회수 증가 비동기 호출
    supabase.rpc('increment_view_count', { p_post_id: postId }).then();

    const { data, error } = await supabase
      .from('posts')
      .select(`
        id, author_id, category, title, content, is_anonymous, images,
        views_count, likes_count, comments_count, created_at, updated_at,
        profiles ( name, hospital_name )
      `)
      .eq('id', postId)
      .single();

    if (error || !data) {
      console.error('Error fetching post detail:', error);
      return null;
    }

    let isLiked = false;
    let isBookmarked = false;

    if (currentUserId) {
      const [likeRes, bookmarkRes] = await Promise.all([
        supabase
          .from('likes')
          .select('id')
          .eq('user_id', currentUserId)
          .eq('target_type', 'post')
          .eq('target_id', postId)
          .maybeSingle(),
        supabase
          .from('bookmarks')
          .select('id')
          .eq('user_id', currentUserId)
          .eq('target_type', 'post')
          .eq('target_id', postId)
          .maybeSingle(),
      ]);
      isLiked = !!likeRes.data;
      isBookmarked = !!bookmarkRes.data;
    }

    const isAnon = data.is_anonymous;
    const postData: any = data;
    return {
      id: postData.id,
      authorId: postData.author_id,
      authorName: isAnon ? '익명 간호사' : (postData.profiles?.name || '간호사'),
      authorHospital: isAnon ? '익명 병원' : (postData.profiles?.hospital_name || '종합병원'),
      category: postData.category,
      title: postData.title,
      content: postData.content,
      isAnonymous: isAnon,
      images: postData.images || [],
      viewsCount: postData.views_count || 0,
      likesCount: postData.likes_count || 0,
      commentsCount: postData.comments_count || 0,
      isLiked,
      isBookmarked,
      createdAt: postData.created_at,
      updatedAt: postData.updated_at,
    };
  },

  // 게시글 작성 (C3)
  async createPost(post: {
    authorId: string;
    category: string;
    title: string;
    content: string;
    isAnonymous?: boolean;
    images?: string[];
  }): Promise<string> {
    const { data, error } = await supabase
      .from('posts')
      .insert({
        author_id: post.authorId,
        category: post.category,
        title: post.title,
        content: post.content,
        is_anonymous: post.isAnonymous ?? true,
        images: post.images || [],
      })
      .select('id')
      .single();

    if (error) {
      console.error('Error creating post:', error);
      throw error;
    }
    return data.id;
  },

  // 게시글 수정 (C4)
  async updatePost(
    postId: string,
    updates: {
      category?: string;
      title?: string;
      content?: string;
      isAnonymous?: boolean;
      images?: string[];
    }
  ): Promise<boolean> {
    const { error } = await supabase
      .from('posts')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', postId);

    if (error) {
      console.error('Error updating post:', error);
      throw error;
    }
    return true;
  },

  // 게시글 삭제 (C5)
  async deletePost(postId: string): Promise<boolean> {
    const { error } = await supabase.from('posts').delete().eq('id', postId);
    if (error) {
      console.error('Error deleting post:', error);
      throw error;
    }
    return true;
  },

  // 댓글 목록 조회 (계층형 대댓글 구조 정렬)
  async getComments(postId: string, currentUserId?: string): Promise<CommentItem[]> {
    const { data, error } = await supabase
      .from('comments')
      .select(`
        id, post_id, parent_id, author_id, content, is_anonymous, likes_count, created_at,
        profiles ( name, hospital_name )
      `)
      .eq('post_id', postId)
      .eq('is_hidden', false)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error fetching comments:', error);
      return [];
    }

    const commentList = (data || []).map((row: any) => ({
      id: row.id,
      postId: row.post_id,
      parentId: row.parent_id || undefined,
      authorId: row.author_id,
      authorName: row.is_anonymous ? '익명 간호사' : (row.profiles?.name || '간호사'),
      authorHospital: row.is_anonymous ? '익명 병원' : (row.profiles?.hospital_name || '종합병원'),
      content: row.content,
      isAnonymous: row.is_anonymous,
      likesCount: row.likes_count || 0,
      createdAt: row.created_at,
      replies: [] as CommentItem[],
    }));

    // 트리 구조로 조합 (부모 댓글 아래 자식 댓글 매핑)
    const rootComments: CommentItem[] = [];
    const map = new Map<string, CommentItem>();

    commentList.forEach((c) => map.set(c.id, c));
    commentList.forEach((c) => {
      if (c.parentId && map.has(c.parentId)) {
        map.get(c.parentId)!.replies!.push(c);
      } else {
        rootComments.push(c);
      }
    });

    return rootComments;
  },

  // 댓글 작성 (C6)
  async addComment(comment: {
    postId: string;
    authorId: string;
    content: string;
    parentId?: string;
    isAnonymous?: boolean;
  }): Promise<string> {
    const { data, error } = await supabase
      .from('comments')
      .insert({
        post_id: comment.postId,
        author_id: comment.authorId,
        content: comment.content,
        parent_id: comment.parentId || null,
        is_anonymous: comment.isAnonymous ?? true,
      })
      .select('id')
      .single();

    if (error) {
      console.error('Error adding comment:', error);
      throw error;
    }

    // 게시글 댓글 수 갱신
    await supabase.rpc('increment_view_count' as any, {}); // 트리거 또는 직관적 관리
    return data.id;
  },

  // 댓글 삭제 (C7)
  async deleteComment(commentId: string): Promise<boolean> {
    const { error } = await supabase.from('comments').delete().eq('id', commentId);
    if (error) {
      console.error('Error deleting comment:', error);
      throw error;
    }
    return true;
  },

  // 좋아요 토글 (C8)
  async toggleLike(userId: string, targetType: 'post' | 'comment', targetId: string): Promise<boolean> {
    const { data: existing } = await supabase
      .from('likes')
      .select('id')
      .eq('user_id', userId)
      .eq('target_type', targetType)
      .eq('target_id', targetId)
      .maybeSingle();

    if (existing) {
      await supabase.from('likes').delete().eq('id', existing.id);
      return false; // 좋아요 취소됨
    } else {
      await supabase.from('likes').insert({
        user_id: userId,
        target_type: targetType,
        target_id: targetId,
      });
      return true; // 좋아요 추가됨
    }
  },

  // 북마크 토글 (C9)
  async toggleBookmark(userId: string, targetType: 'post' | 'study_guide', targetId: string): Promise<boolean> {
    const { data: existing } = await supabase
      .from('bookmarks')
      .select('id')
      .eq('user_id', userId)
      .eq('target_type', targetType)
      .eq('target_id', targetId)
      .maybeSingle();

    if (existing) {
      await supabase.from('bookmarks').delete().eq('id', existing.id);
      return false;
    } else {
      await supabase.from('bookmarks').insert({
        user_id: userId,
        target_type: targetType,
        target_id: targetId,
      });
      return true;
    }
  },

  // 신고 접수 (R1)
  async reportContent(params: {
    reporterId: string;
    targetType: 'post' | 'comment' | 'user';
    targetId: string;
    reason: string;
    description?: string;
  }): Promise<boolean> {
    const { error } = await supabase.from('reports').insert({
      reporter_id: params.reporterId,
      target_type: params.targetType,
      target_id: params.targetId,
      reason: params.reason,
      description: params.description || null,
    });

    if (error) {
      console.error('Error reporting content:', error);
      throw error;
    }
    return true;
  },

  // 사용자 차단 (R2)
  async blockUser(blockerId: string, blockedId: string): Promise<boolean> {
    const { error } = await supabase.from('blocks').insert({
      blocker_id: blockerId,
      blocked_id: blockedId,
    });

    if (error) {
      console.error('Error blocking user:', error);
      throw error;
    }
    return true;
  },
};

