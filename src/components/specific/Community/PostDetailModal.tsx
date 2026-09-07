import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Image,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Share,
} from 'react-native';
import { COLORS } from '../../../constants/theme';
import { PostItem, CommentItem } from '../../../mocks/communityData';
import { useCommunityStore } from '../../../store/useCommunityStore';
import { useUserStore } from '../../../store/useUserStore';
import {
  HeartIcon,
  CommentIcon,
  ShareIcon,
  BookmarkIcon,
  BadgeCheckIcon,
  MoreVerticalIcon,
  CornerDownRightIcon,
  SendIcon,
  LockIcon,
} from '../../common/Icon';
import { ReportModal } from './ReportModal';
import { PostWriteModal } from './PostWriteModal';

interface PostDetailModalProps {
  visible: boolean;
  post: PostItem | null;
  onClose: () => void;
}

export const PostDetailModal: React.FC<PostDetailModalProps> = ({
  visible,
  post,
  onClose,
}) => {
  const {
    posts,
    blockedUserIds,
    toggleLikePost,
    toggleBookmarkPost,
    deletePost,
    addComment,
    addReply,
    toggleLikeComment,
    toggleLikeReply,
    blockUser,
  } = useCommunityStore();

  // 최신 동기화된 post 가져오기
  const currentPost = posts.find((p) => p.id === post?.id) || post;

  // 댓글 입력 상태
  const [commentText, setCommentText] = useState('');
  const [isAnonymousComment, setIsAnonymousComment] = useState(true);

  // 대댓글 모드 (null이면 원댓글 작성)
  const [replyingComment, setReplyingComment] = useState<{
    commentId: string;
    targetName: string;
  } | null>(null);

  // 모달 제어 상태
  const [reportModalVisible, setReportModalVisible] = useState(false);
  const [reportTarget, setReportTarget] = useState<{
    id: string;
    type: 'post' | 'comment';
  }>({ id: '', type: 'post' });

  const [editModalVisible, setEditModalVisible] = useState(false);

  if (!currentPost) return null;

  // 작성자가 차단된 사용자인지 확인
  const isAuthorBlocked = blockedUserIds.includes(currentPost.authorId);

  // 게시글 공유 기능
  const handleShare = async () => {
    try {
      await Share.share({
        message: `[우간다 간호 커뮤니티] ${currentPost.title}\nhttps://weganda.app/post/${currentPost.id}`,
      });
    } catch {
      Alert.alert('공유 완료', '게시글 링크가 클립보드에 복사되었습니다.');
    }
  };

  // 더보기 메뉴 (수정/삭제 or 신고/차단)
  const handleMoreOptions = () => {
    if (currentPost.isMyPost) {
      Alert.alert('게시글 관리', '원하시는 작업을 선택해 주세요.', [
        { text: '글 수정하기', onPress: () => setEditModalVisible(true) },
        {
          text: '글 삭제하기',
          style: 'destructive',
          onPress: () => {
            Alert.alert('글 삭제', '정말 이 게시글을 삭제하시겠습니까?', [
              { text: '취소', style: 'cancel' },
              {
                text: '삭제',
                style: 'destructive',
                onPress: () => {
                  deletePost(currentPost.id);
                  onClose();
                },
              },
            ]);
          },
        },
        { text: '취소', style: 'cancel' },
      ]);
    } else {
      Alert.alert('게시글 옵션', '원하시는 작업을 선택해 주세요.', [
        {
          text: '게시글 신고하기',
          onPress: () => {
            setReportTarget({ id: currentPost.id, type: 'post' });
            setReportModalVisible(true);
          },
        },
        {
          text: `${currentPost.authorName}님 차단하기`,
          style: 'destructive',
          onPress: () => {
            Alert.alert(
              '작성자 차단',
              `정말 ${currentPost.authorName}님을 차단하시겠습니까? 차단 시 해당 사용자의 모든 글과 댓글이 숨김 처리됩니다.`,
              [
                { text: '취소', style: 'cancel' },
                {
                  text: '차단하기',
                  style: 'destructive',
                  onPress: () => {
                    blockUser(currentPost.authorId);
                    Alert.alert('차단 완료', '해당 사용자가 차단되었습니다.');
                    onClose();
                  },
                },
              ]
            );
          },
        },
        { text: '취소', style: 'cancel' },
      ]);
    }
  };

  const userId = useUserStore((s) => s.id);

  // 댓글 / 대댓글 전송
  const handleSendComment = () => {
    if (!commentText.trim()) return;

    if (replyingComment) {
      // 대댓글 등록
      addReply(
        currentPost.id,
        replyingComment.commentId,
        replyingComment.targetName,
        commentText.trim(),
        isAnonymousComment,
        userId || undefined
      );
      setReplyingComment(null);
    } else {
      // 원댓글 등록
      addComment(currentPost.id, commentText.trim(), isAnonymousComment, userId || undefined);
    }

    setCommentText('');
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={false} onRequestClose={onClose}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        {/* 상단 네비게이션 바 */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
            <Text style={styles.backBtnText}>‹ 뒤로</Text>
          </TouchableOpacity>

          <View style={styles.headerActionRow}>
            {/* 북마크 (보관함) */}
            <TouchableOpacity
              style={styles.headerIconBtn}
              onPress={() => toggleBookmarkPost(currentPost.id, userId || undefined)}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <BookmarkIcon
                size={20}
                color={currentPost.isBookmarked ? COLORS.primary : COLORS.textMuted}
                filled={currentPost.isBookmarked}
              />
            </TouchableOpacity>

            {/* 공유 */}
            <TouchableOpacity
              style={styles.headerIconBtn}
              onPress={handleShare}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <ShareIcon size={20} color={COLORS.textPrimary} />
            </TouchableOpacity>

            {/* 더보기 */}
            <TouchableOpacity
              style={styles.headerIconBtn}
              onPress={handleMoreOptions}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <MoreVerticalIcon size={20} color={COLORS.textPrimary} />
            </TouchableOpacity>
          </View>
        </View>

        <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
          {/* 차단된 작성자 경고 */}
          {isAuthorBlocked ? (
            <View style={styles.blockedBanner}>
              <Text style={styles.blockedBannerText}>차단된 사용자의 게시글입니다.</Text>
            </View>
          ) : (
            <>
              {/* 카테고리 뱃지 & 메타 정보 */}
              <View style={styles.metaRow}>
                <View style={styles.categoryBadge}>
                  <Text style={styles.categoryBadgeText}>{currentPost.category}</Text>
                </View>
                <Text style={styles.timeViewsText}>
                  {currentPost.timeAgo} • 조회 {currentPost.views}
                </Text>
              </View>

              {/* 작성자 프로필 바 */}
              <View style={styles.authorBar}>
                <View style={styles.authorAvatar}>
                  <Text style={styles.authorAvatarText}>
                    {currentPost.isAnonymous ? '익' : currentPost.authorName.slice(0, 1)}
                  </Text>
                </View>

                <View style={styles.authorInfo}>
                  <View style={styles.authorNameRow}>
                    <Text style={styles.authorName}>{currentPost.authorName}</Text>
                    {currentPost.isVerifiedHospital && !currentPost.isAnonymous && (
                      <View style={styles.verifiedBadge}>
                        <BadgeCheckIcon size={13} color="#0284C7" />
                        <Text style={styles.verifiedBadgeText}>병원인증</Text>
                      </View>
                    )}
                  </View>
                  <Text style={styles.authorHospital}>{currentPost.authorHospital}</Text>
                </View>
              </View>

              {/* 글 제목 */}
              <Text style={styles.postTitle}>{currentPost.title}</Text>

              {/* 글 본문 */}
              <Text style={styles.postContent}>{currentPost.content}</Text>

              {/* 첨부 사진 갤러리 */}
              {currentPost.images && currentPost.images.length > 0 && (
                <View style={styles.gallery}>
                  {currentPost.images.map((imgUri, idx) => (
                    <Image key={idx} source={{ uri: imgUri }} style={styles.galleryImage} />
                  ))}
                </View>
              )}

              {/* 하단 반응 바 (추천 버튼 & 공유 버튼) */}
              <View style={styles.reactionBar}>
                <TouchableOpacity
                  style={[styles.likePillBtn, currentPost.isLiked && styles.likePillBtnActive]}
                  onPress={() => toggleLikePost(currentPost.id, userId || undefined)}
                  activeOpacity={0.8}
                >
                  <HeartIcon
                    size={18}
                    color={currentPost.isLiked ? COLORS.primary : COLORS.textMuted}
                    filled={currentPost.isLiked}
                  />
                  <Text style={[styles.likePillText, currentPost.isLiked && styles.likePillTextActive]}>
                    추천 {currentPost.likes}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.shareSubBtn} onPress={handleShare} activeOpacity={0.8}>
                  <ShareIcon size={16} color={COLORS.textSecondary} />
                  <Text style={styles.shareSubText}>공유하기</Text>
                </TouchableOpacity>
              </View>
            </>
          )}

          <View style={styles.sectionDivider} />

          {/* ── 댓글 섹션 ── */}
          <View style={styles.commentSectionHeader}>
            <Text style={styles.commentSectionTitle}>댓글 {currentPost.commentsCount}</Text>
          </View>

          {/* 댓글 목록 */}
          <View style={styles.commentList}>
            {currentPost.comments.length === 0 ? (
              <View style={styles.emptyCommentBox}>
                <Text style={styles.emptyCommentText}>
                  첫 번째 댓글을 남겨 동료 간호사에게 힘이 되어주세요!
                </Text>
              </View>
            ) : (
              currentPost.comments.map((comment) => (
                <View key={comment.id} style={styles.commentItem}>
                  {/* 원댓글 헤더 */}
                  <View style={styles.commentTopRow}>
                    <View style={styles.commentAuthorRow}>
                      <Text style={styles.commentAuthorName}>{comment.authorName}</Text>
                      {comment.isVerifiedHospital && !comment.isAnonymous && (
                        <View style={styles.miniVerifiedBadge}>
                          <BadgeCheckIcon size={11} color="#0284C7" />
                        </View>
                      )}
                      <Text style={styles.commentTime}>{comment.timeAgo}</Text>
                    </View>

                    {/* 댓글 좋아요 */}
                    <TouchableOpacity
                      style={styles.commentLikeBtn}
                      onPress={() => toggleLikeComment(currentPost.id, comment.id, userId || undefined)}
                    >
                      <HeartIcon
                        size={13}
                        color={comment.isLiked ? COLORS.primary : COLORS.textMuted}
                      />
                      <Text
                        style={[
                          styles.commentLikeCount,
                          comment.isLiked && styles.commentLikeCountActive,
                        ]}
                      >
                        {comment.likes}
                      </Text>
                    </TouchableOpacity>
                  </View>

                  {/* 댓글 내용 */}
                  <Text style={styles.commentBodyText}>{comment.content}</Text>

                  {/* 대댓글 작성 버튼 */}
                  <TouchableOpacity
                    style={styles.replyActionBtn}
                    onPress={() =>
                      setReplyingComment({
                        commentId: comment.id,
                        targetName: comment.authorName,
                      })
                    }
                  >
                    <Text style={styles.replyActionText}>답글 달기</Text>
                  </TouchableOpacity>

                  {/* ── 대댓글 (Nested Replies) ── */}
                  {comment.replies && comment.replies.length > 0 && (
                    <View style={styles.replyList}>
                      {comment.replies.map((reply) => (
                        <View key={reply.id} style={styles.replyRow}>
                          <CornerDownRightIcon size={14} color={COLORS.textMuted} />
                          <View style={styles.replyBubble}>
                            <View style={styles.replyTopRow}>
                              <View style={styles.commentAuthorRow}>
                                <Text style={styles.commentAuthorName}>{reply.authorName}</Text>
                                <Text style={styles.commentTime}>{reply.timeAgo}</Text>
                              </View>
                              <TouchableOpacity
                                style={styles.commentLikeBtn}
                                onPress={() =>
                                  toggleLikeReply(currentPost.id, comment.id, reply.id)
                                }
                              >
                                <HeartIcon
                                  size={12}
                                  color={reply.isLiked ? COLORS.primary : COLORS.textMuted}
                                />
                                <Text
                                  style={[
                                    styles.commentLikeCount,
                                    reply.isLiked && styles.commentLikeCountActive,
                                  ]}
                                >
                                  {reply.likes}
                                </Text>
                              </TouchableOpacity>
                            </View>

                            <Text style={styles.replyBodyText}>
                              <Text style={styles.mentionTag}>@{reply.replyTo} </Text>
                              {reply.content}
                            </Text>
                          </View>
                        </View>
                      ))}
                    </View>
                  )}
                </View>
              ))
            )}
          </View>
        </ScrollView>

        {/* ── 하단 고정 댓글 입력창 ── */}
        <View style={styles.inputStickyContainer}>
          {/* 대댓글 타겟 표시 배너 */}
          {replyingComment && (
            <View style={styles.replyingTargetBanner}>
              <Text style={styles.replyingTargetText}>
                @{replyingComment.targetName}님에게 답글 작성 중
              </Text>
              <TouchableOpacity onPress={() => setReplyingComment(null)}>
                <Text style={styles.replyingCancelText}>✕ 취소</Text>
              </TouchableOpacity>
            </View>
          )}

          <View style={styles.inputBarRow}>
            {/* 익명 토글 버튼 */}
            <TouchableOpacity
              style={[
                styles.anonymousBtn,
                isAnonymousComment && styles.anonymousBtnActive,
              ]}
              onPress={() => setIsAnonymousComment(!isAnonymousComment)}
              activeOpacity={0.8}
            >
              <LockIcon
                size={13}
                color={isAnonymousComment ? COLORS.primary : COLORS.textMuted}
              />
              <Text
                style={[
                  styles.anonymousBtnText,
                  isAnonymousComment && styles.anonymousBtnTextActive,
                ]}
              >
                익명
              </Text>
            </TouchableOpacity>

            <TextInput
              style={styles.commentTextInput}
              value={commentText}
              onChangeText={setCommentText}
              placeholder={
                replyingComment
                  ? '답글을 입력하세요...'
                  : '따뜻한 위로와 조언의 댓글을 남겨보세요...'
              }
              placeholderTextColor={COLORS.textMuted}
            />

            <TouchableOpacity
              style={[
                styles.sendCommentBtn,
                !commentText.trim() && styles.sendCommentBtnDisabled,
              ]}
              onPress={handleSendComment}
              disabled={!commentText.trim()}
              activeOpacity={0.85}
            >
              <SendIcon size={16} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        </View>

        {/* 신고 모달 */}
        <ReportModal
          visible={reportModalVisible}
          targetId={reportTarget.id}
          targetType={reportTarget.type}
          onClose={() => setReportModalVisible(false)}
        />

        {/* 글 수정 모달 */}
        <PostWriteModal
          visible={editModalVisible}
          editPost={currentPost}
          onClose={() => setEditModalVisible(false)}
        />
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 54,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
    backgroundColor: '#FFFFFF',
  },
  backBtnText: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.primary,
  },
  headerActionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  headerIconBtn: {
    padding: 2,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 30,
  },
  blockedBanner: {
    backgroundColor: '#F3F4F6',
    padding: 16,
    borderRadius: 14,
    alignItems: 'center',
    marginVertical: 20,
  },
  blockedBannerText: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.textMuted,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  categoryBadge: {
    backgroundColor: '#FFF1F4',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  categoryBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.primary,
  },
  timeViewsText: {
    fontSize: 11,
    color: COLORS.textMuted,
  },
  authorBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  authorAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFF1F4',
    alignItems: 'center',
    justifyContent: 'center',
  },
  authorAvatarText: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.primary,
  },
  authorInfo: {
    flex: 1,
  },
  authorNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  authorName: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    backgroundColor: '#F0F9FF',
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 4,
  },
  verifiedBadgeText: {
    fontSize: 9,
    fontWeight: '700',
    color: '#0284C7',
  },
  authorHospital: {
    fontSize: 11,
    color: COLORS.textMuted,
    marginTop: 1,
  },
  postTitle: {
    fontSize: 19,
    fontWeight: '800',
    color: COLORS.textPrimary,
    lineHeight: 26,
    marginBottom: 14,
  },
  postContent: {
    fontSize: 14,
    color: COLORS.textPrimary,
    lineHeight: 22,
    marginBottom: 16,
  },
  gallery: {
    gap: 10,
    marginBottom: 18,
  },
  galleryImage: {
    width: '100%',
    height: 220,
    borderRadius: 14,
    resizeMode: 'cover',
  },
  reactionBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
  },
  likePillBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FFF1F4',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#FFE4EA',
  },
  likePillBtnActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  likePillText: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.primary,
  },
  likePillTextActive: {
    color: '#FFFFFF',
  },
  shareSubBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    backgroundColor: '#F9FAFB',
  },
  shareSubText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  sectionDivider: {
    height: 8,
    backgroundColor: '#F8F9FA',
    marginHorizontal: -20,
    marginVertical: 16,
  },
  commentSectionHeader: {
    marginBottom: 16,
  },
  commentSectionTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  commentList: {
    gap: 16,
  },
  emptyCommentBox: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  emptyCommentText: {
    fontSize: 13,
    color: COLORS.textMuted,
  },
  commentItem: {
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
    paddingBottom: 14,
  },
  commentTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  commentAuthorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  commentAuthorName: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  miniVerifiedBadge: {
    padding: 1,
  },
  commentTime: {
    fontSize: 11,
    color: COLORS.textMuted,
  },
  commentLikeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    padding: 4,
  },
  commentLikeCount: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.textMuted,
  },
  commentLikeCountActive: {
    color: COLORS.primary,
    fontWeight: '700',
  },
  commentBodyText: {
    fontSize: 13,
    color: COLORS.textPrimary,
    lineHeight: 18,
    marginBottom: 6,
  },
  replyActionBtn: {
    alignSelf: 'flex-start',
    paddingVertical: 2,
  },
  replyActionText: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.primary,
  },
  replyList: {
    marginTop: 10,
    gap: 8,
  },
  replyRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 6,
    paddingLeft: 8,
  },
  replyBubble: {
    flex: 1,
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 10,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  replyTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  replyBodyText: {
    fontSize: 12,
    color: COLORS.textPrimary,
    lineHeight: 17,
  },
  mentionTag: {
    color: COLORS.primary,
    fontWeight: '700',
  },
  inputStickyContainer: {
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 16,
  },
  replyingTargetBanner: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFF1F4',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    marginBottom: 8,
  },
  replyingTargetText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.primary,
  },
  replyingCancelText: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.textMuted,
  },
  inputBarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  anonymousBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 10,
    paddingVertical: 10,
    borderRadius: 18,
  },
  anonymousBtnActive: {
    backgroundColor: '#FFF1F4',
    borderWidth: 1,
    borderColor: COLORS.primaryLight,
  },
  anonymousBtnText: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.textMuted,
  },
  anonymousBtnTextActive: {
    color: COLORS.primary,
    fontWeight: '700',
  },
  commentTextInput: {
    flex: 1,
    backgroundColor: '#F3F4F6',
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 9,
    fontSize: 13,
    color: COLORS.textPrimary,
  },
  sendCommentBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendCommentBtnDisabled: {
    backgroundColor: '#E5E7EB',
  },
});

export default PostDetailModal;

