export type PostCategory =
  | '임상/질문'
  | '교대근무 고민'
  | '이직/커리어'
  | '간호대생 라운지'
  | '채용/취업 정보'
  | '자유게시판';

export interface ReplyItem {
  id: string;
  commentId: string;
  authorId: string;
  authorName: string;
  authorHospital: string;
  isVerifiedHospital: boolean;
  isAnonymous: boolean;
  isMyReply?: boolean;
  replyTo: string; // e.g. '임상멘토'
  content: string;
  timeAgo: string;
  likes: number;
  isLiked: boolean;
}

export interface CommentItem {
  id: string;
  postId: string;
  authorId: string;
  authorName: string;
  authorHospital: string;
  isVerifiedHospital: boolean;
  isAnonymous: boolean;
  isMyComment?: boolean;
  content: string;
  timeAgo: string;
  likes: number;
  isLiked: boolean;
  replies: ReplyItem[];
}

export interface PostItem {
  id: string;
  category: PostCategory;
  title: string;
  content: string;
  authorId: string;
  authorName: string;
  authorHospital: string;
  isVerifiedHospital: boolean; // 병원 인증 뱃지
  isAnonymous: boolean; // 작성자 완전 익명 마스킹
  isMyPost?: boolean; // 본인 글 (수정/삭제 가능)
  views: number;
  likes: number;
  isLiked: boolean;
  isBookmarked: boolean; // 임상 족보 / 북마크 보관함
  timeAgo: string;
  images: string[]; // 첨부 사진 최대 3장
  commentsCount: number;
  comments: CommentItem[];
}

export interface HotTopic {
  id: string;
  rank: number;
  category: string;
  title: string;
  likes: number;
  comments: number;
}

