import { create } from 'zustand';
import { PostItem, CommentItem, ReplyItem, MOCK_POSTS_DATA } from '../mocks/communityData';
import { communityApi } from '../services/communityApi';
import { useUserStore } from './useUserStore';
import { getAppTheme } from '../constants/theme';

interface CommunityState {
  posts: PostItem[];
  blockedUserIds: string[];
  hiddenPostIds: string[];
  isLoading: boolean;
  error: string | null;

  // Actions
  fetchPosts: (category?: string, userId?: string) => Promise<void>;
  toggleLikePost: (postId: string, userId?: string) => void;
  toggleBookmarkPost: (postId: string, userId?: string) => void;
  createPost: (
    title: string,
    content: string,
    category: PostItem['category'],
    isAnonymous: boolean,
    images: string[],
    authorId?: string
  ) => Promise<void>;
  updatePost: (
    postId: string,
    title: string,
    content: string,
    category: PostItem['category'],
    isAnonymous: boolean,
    images: string[]
  ) => void;
  deletePost: (postId: string) => void;

  // Comments & Replies
  addComment: (postId: string, content: string, isAnonymous: boolean, authorId?: string) => void;
  addReply: (
    postId: string,
    commentId: string,
    replyTo: string,
    content: string,
    isAnonymous: boolean,
    authorId?: string
  ) => void;
  toggleLikeComment: (postId: string, commentId: string, userId?: string) => void;
  toggleLikeReply: (postId: string, commentId: string, replyId: string) => void;

  // Block & Report & Hide
  blockUser: (authorId: string, blockerId?: string) => void;
  hidePost: (postId: string) => void;
  hideComment: (postId: string, commentId: string) => void;
  loadModeration: () => Promise<void>;
  reportContent: (targetId: string, targetType: 'post' | 'comment', reason: string, reporterId?: string) => void;
}

// 게스트/프리뷰가 아닌 실제 로그인 사용자 ID (신고·차단 서버 기록용)
const getRealUserId = (): string | undefined => {
  const u = useUserStore.getState();
  if (u.isGuest || !u.id || u.id === 'guest_user_preview') return undefined;
  return u.id;
};

// 숨김/차단된 항목을 피드에서 제외 (호출 시점에 스토어 상태를 읽는다)
const filterModerated = (list: PostItem[]): PostItem[] => {
  const { hiddenPostIds, blockedUserIds } = useCommunityStore.getState();
  return list.filter((p) => !hiddenPostIds.includes(p.id) && !blockedUserIds.includes(p.authorId));
};

export const useCommunityStore = create<CommunityState>((set, get) => ({
  posts: [],
  blockedUserIds: [],
  hiddenPostIds: [],
  isLoading: false,
  error: null,

  // 게시글 목록 DB 조회
  fetchPosts: async (category?: string, userId?: string) => {
    try {
      set({ isLoading: true, error: null });
      await get().loadModeration();
      const serverPosts = await communityApi.getPosts({ category, userId });
      if (serverPosts && serverPosts.length > 0) {
        const mapped: PostItem[] = serverPosts.map((p) => ({
          id: p.id,
          authorId: p.authorId,
          authorName: p.authorName || (p.isAnonymous ? '익명' : '간호사'),
          authorRole: '간호사',
          authorHospital: p.authorHospital || '병원',
          authorWard: '병동',
          authorExperience: '간호사',
          authorAvatarLetter: p.authorName ? p.authorName.charAt(0) : '간',
          authorAvatarBg: getAppTheme(useUserStore.getState().appThemeColor).primary,
          isVerifiedHospital: true,
          category: p.category as any,
          title: p.title,
          content: p.content,
          createdAt: new Date(p.createdAt).toLocaleDateString('ko-KR', { month: 'numeric', day: 'numeric' }),
          timeAgo: new Date(p.createdAt).toLocaleDateString('ko-KR', { month: 'numeric', day: 'numeric' }),
          views: p.viewsCount,
          likes: p.likesCount,
          isLiked: p.isLiked || false,
          isBookmarked: p.isBookmarked || false,
          commentsCount: p.commentsCount,
          viewsCount: p.viewsCount,
          isAnonymous: p.isAnonymous,
          images: p.images,
          comments: [],
        }));
        set({ posts: filterModerated(mapped), isLoading: false, error: null });
      } else {
        const userState = useUserStore.getState();
        const isGuest = userState.isGuest || userState.id === 'guest_user_preview';
        set({ posts: isGuest ? filterModerated(MOCK_POSTS_DATA) : [], isLoading: false, error: null });
      }
    } catch (e: any) {
      console.warn('Notice fetching posts from backend:', e);
      const userState = useUserStore.getState();
      const isGuest = userState.isGuest || userState.id === 'guest_user_preview';
      const filteredMocks = filterModerated(MOCK_POSTS_DATA);
      set({
        posts: isGuest ? filteredMocks : [],
        isLoading: false,
        error: isGuest ? null : '게시글 목록을 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.',
      });
    }
  },

  toggleLikePost: (postId, userId) => {
    set((state) => ({
      posts: state.posts.map((p) =>
        p.id === postId
          ? {
              ...p,
              isLiked: !p.isLiked,
              likes: p.isLiked ? p.likes - 1 : p.likes + 1,
            }
          : p
      ),
    }));

    if (userId) {
      communityApi.toggleLike(userId, 'post', postId).catch((e) => {
        console.error('Failed to toggle like on backend:', e);
      });
    }
  },

  toggleBookmarkPost: (postId, userId) => {
    set((state) => ({
      posts: state.posts.map((p) =>
        p.id === postId ? { ...p, isBookmarked: !p.isBookmarked } : p
      ),
    }));
  },

  createPost: async (title, content, category, isAnonymous, images, authorId) => {
    const localId = `post_${Date.now()}`;
    const newPost: PostItem = {
      id: localId,
      category,
      title,
      content,
      authorId: authorId || 'my_user_id',
      authorName: isAnonymous ? '익명 간호사' : '나 (간호사)',
      authorHospital: isAnonymous ? '익명 병원' : '종합병원',
      isVerifiedHospital: true,
      isAnonymous,
      isMyPost: true,
      views: 1,
      likes: 0,
      isLiked: false,
      isBookmarked: false,
      timeAgo: '방금 전',
      images,
      commentsCount: 0,
      comments: [],
    };

    set((state) => ({ posts: [newPost, ...state.posts] }));

    if (authorId) {
      try {
        const createdId = await communityApi.createPost({
          authorId,
          category,
          title,
          content,
          isAnonymous,
          images,
        });
        // 서버 ID로 교체
        set((state) => ({
          posts: state.posts.map((p) => (p.id === localId ? { ...p, id: createdId } : p)),
        }));
      } catch (e) {
        console.error('Failed to create post on backend:', e);
      }
    }
  },

  updatePost: (postId, title, content, category, isAnonymous, images) =>
    set((state) => ({
      posts: state.posts.map((p) =>
        p.id === postId
          ? {
              ...p,
              title,
              content,
              category,
              isAnonymous,
              authorName: isAnonymous ? '익명 간호사' : '나 (간호사)',
              authorHospital: isAnonymous ? '익명 병원' : '종합병원',
              images,
            }
          : p
      ),
    })),

  deletePost: (postId) => {
    set((state) => ({
      posts: state.posts.filter((p) => p.id !== postId),
    }));
    communityApi.deletePost(postId).catch((e) => console.error('Failed to delete post on backend:', e));
  },

  addComment: (postId, content, isAnonymous, authorId) => {
    const newComment: CommentItem = {
      id: `comment_${Date.now()}`,
      postId,
      authorId: authorId || 'my_user_id',
      authorName: isAnonymous ? '익명 간호사' : '나 (간호사)',
      authorHospital: isAnonymous ? '익명 병원' : '종합병원',
      isVerifiedHospital: true,
      isAnonymous,
      content,
      timeAgo: '방금 전',
      likes: 0,
      isLiked: false,
      replies: [],
    };

    set((state) => ({
      posts: state.posts.map((p) => {
        if (p.id !== postId) return p;
        return {
          ...p,
          commentsCount: p.commentsCount + 1,
          comments: [...p.comments, newComment],
        };
      }),
    }));

    if (authorId) {
      communityApi.addComment({ postId, authorId, content, isAnonymous }).catch((e) => {
        console.error('Failed to add comment on backend:', e);
      });
    }
  },

  addReply: (postId, commentId, replyTo, content, isAnonymous, authorId) => {
    const newReply: ReplyItem = {
      id: `reply_${Date.now()}`,
      commentId,
      authorId: authorId || 'my_user_id',
      authorName: isAnonymous ? '익명 간호사' : '나 (간호사)',
      authorHospital: isAnonymous ? '익명 병원' : '종합병원',
      isVerifiedHospital: true,
      isAnonymous,
      content,
      timeAgo: '방금 전',
      likes: 0,
      isLiked: false,
      replyTo,
    };

    set((state) => ({
      posts: state.posts.map((p) => {
        if (p.id !== postId) return p;
        return {
          ...p,
          commentsCount: p.commentsCount + 1,
          comments: p.comments.map((c) =>
            c.id === commentId ? { ...c, replies: [...c.replies, newReply] } : c
          ),
        };
      }),
    }));

    if (authorId) {
      communityApi.addComment({ postId, authorId, content, parentId: commentId, isAnonymous }).catch((e) => {
        console.error('Failed to add reply on backend:', e);
      });
    }
  },

  toggleLikeComment: (postId, commentId, userId) => {
    set((state) => ({
      posts: state.posts.map((p) => {
        if (p.id !== postId) return p;
        return {
          ...p,
          comments: p.comments.map((c) =>
            c.id === commentId
              ? {
                  ...c,
                  isLiked: !c.isLiked,
                  likes: c.isLiked ? c.likes - 1 : c.likes + 1,
                }
              : c
          ),
        };
      }),
    }));

    if (userId) {
      communityApi.toggleLike(userId, 'comment', commentId).catch((e) => console.error(e));
    }
  },

  toggleLikeReply: (postId, commentId, replyId) =>
    set((state) => ({
      posts: state.posts.map((p) => {
        if (p.id !== postId) return p;
        return {
          ...p,
          comments: p.comments.map((c) => {
            if (c.id !== commentId) return c;
            return {
              ...c,
              replies: c.replies.map((r) =>
                r.id === replyId
                  ? {
                      ...r,
                      isLiked: !r.isLiked,
                      likes: r.isLiked ? r.likes - 1 : r.likes + 1,
                    }
                  : r
              ),
            };
          }),
        };
      }),
    })),

  // 서버 차단/신고 이력을 불러와 재실행 후에도 피드에서 계속 제외한다(게스트는 제외).
  loadModeration: async () => {
    const userId = getRealUserId();
    if (!userId) return;
    const [blocked, reportedPosts] = await Promise.all([
      communityApi.getBlockedUserIds(userId),
      communityApi.getReportedPostIds(userId),
    ]);
    set((state) => ({
      blockedUserIds: Array.from(new Set([...state.blockedUserIds, ...blocked])),
      hiddenPostIds: Array.from(new Set([...state.hiddenPostIds, ...reportedPosts])),
    }));
  },

  blockUser: (authorId, blockerId) => {
    set((state) => ({
      blockedUserIds: Array.from(new Set([...state.blockedUserIds, authorId])),
      posts: state.posts.filter((p) => p.authorId !== authorId),
    }));

    const resolvedBlockerId = blockerId ?? getRealUserId();
    if (resolvedBlockerId) {
      communityApi.blockUser(resolvedBlockerId, authorId).catch((e) => console.error('Failed to block on backend:', e));
    }
  },

  hidePost: (postId: string) => {
    set((state) => ({
      hiddenPostIds: Array.from(new Set([...state.hiddenPostIds, postId])),
      posts: state.posts.filter((p) => p.id !== postId),
    }));
  },

  hideComment: (postId: string, commentId: string) =>
    set((state) => ({
      posts: state.posts.map((p) =>
        p.id !== postId
          ? p
          : {
              ...p,
              comments: p.comments.filter((c) => c.id !== commentId),
              commentsCount: Math.max(0, p.commentsCount - 1),
            }
      ),
    })),

  reportContent: (targetId, targetType, reason, reporterId) => {
    const resolvedReporterId = reporterId ?? getRealUserId();
    if (resolvedReporterId) {
      communityApi.reportContent({
        reporterId: resolvedReporterId,
        targetType,
        targetId,
        reason,
      }).catch((e) => console.error('Failed to report on backend:', e));
    }
  },
}));
