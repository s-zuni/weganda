import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Alert,
} from 'react-native';
import { Card } from '../../common/Card';
import { COLORS, useAppTheme } from '../../../constants/theme';
import {
  HeartIcon,
  CommentIcon,
  EyeIcon,
  BookmarkIcon,
  BadgeCheckIcon,
} from '../../common/Icon';
import { VerifiedNurseBadge } from '../../common/VerifiedNurseBadge';
import { UserAvatar } from '../../common/UserAvatar';
import { useUserStore } from '../../../store/useUserStore';
import { useCommunityStore } from '../../../store/useCommunityStore';
import { PostItem } from '../../../types/community';
import { ReportModal } from './ReportModal';

interface PostCardItemProps {
  post: PostItem;
  onOpenDetail: (post: PostItem) => void;
  onToggleLike: (postId: string) => void;
  onToggleBookmark: (postId: string) => void;
}

export const PostCardItem: React.FC<PostCardItemProps> = ({
  post,
  onOpenDetail,
  onToggleLike,
  onToggleBookmark,
}) => {
  const theme = useAppTheme();
  const avatarUrl = useUserStore((s) => s.avatarUrl);
  const { hidePost, blockUser } = useCommunityStore();
  const [reportVisible, setReportVisible] = useState(false);

  const handlePressMore = () => {
    Alert.alert(
      '게시글 관리 및 신고',
      '원하시는 작업을 선택해 주세요.',
      [
        {
          text: '이 게시글 피드에서 즉시 숨기기',
          style: 'destructive',
          onPress: () => {
            hidePost(post.id);
            Alert.alert('숨김 완료', '해당 게시글이 피드에서 즉시 숨겨졌습니다.');
          },
        },
        {
          text: `작성자(${post.authorName}) 차단하기`,
          style: 'destructive',
          onPress: () => {
            Alert.alert(
              '작성자 차단',
              `'${post.authorName}' 님의 모든 게시글과 댓글을 더 이상 표시하지 않습니다. 차단하시겠습니까?`,
              [
                { text: '취소', style: 'cancel' },
                {
                  text: '차단',
                  style: 'destructive',
                  onPress: () => {
                    blockUser(post.authorId);
                    Alert.alert('차단 완료', `'${post.authorName}' 님이 차단되었습니다.`);
                  },
                },
              ]
            );
          },
        },
        {
          text: '게시글 신고하기 (부적절한 콘텐츠)',
          onPress: () => {
            setReportVisible(true);
          },
        },
        { text: '취소', style: 'cancel' },
      ]
    );
  };

  return (
    <Card style={styles.postCard}>
      <TouchableOpacity onPress={() => onOpenDetail(post)} activeOpacity={0.9}>
        {/* 상단 메타 바 */}
        <View style={styles.postTopMeta}>
          <View style={styles.badgeRow}>
            <View style={styles.cardCategoryBadge}>
              <Text style={styles.cardCategoryText}>{post.category}</Text>
            </View>
          </View>

          <View style={styles.metaRightRow}>
            <Text style={styles.postTimeText}>{post.timeAgo}</Text>
            <TouchableOpacity
              onPress={handlePressMore}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              style={styles.moreBtn}
            >
              <Text style={styles.moreBtnText}>•••</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* 제목 & 본문 프리뷰 */}
        <View style={styles.postContentRow}>
          <View style={styles.postTextCol}>
            <Text style={styles.postCardTitle} numberOfLines={1} ellipsizeMode="tail">
              {post.title}
            </Text>
            <Text style={styles.postCardPreview} numberOfLines={2} ellipsizeMode="tail">
              {post.content}
            </Text>
          </View>

          {/* 썸네일 이미지 (첨부 사진이 있는 경우) */}
          {post.images && post.images.length > 0 && (
            <Image source={{ uri: post.images[0] }} style={styles.postThumbnail} />
          )}
        </View>

        {/* 작성자 & 인터랙션 통계 바 */}
        <View style={styles.postFooter}>
          <View style={styles.authorRow}>
            {!post.isAnonymous && (
              <View style={{ marginRight: 6 }}>
                <UserAvatar
                  uri={post.isMyPost ? avatarUrl : undefined}
                  name={post.authorName}
                  size={18}
                />
              </View>
            )}
            <Text style={styles.authorInfoText}>
              {post.authorName}
            </Text>
            {post.isVerifiedHospital && !post.isAnonymous && (
              <VerifiedNurseBadge size={13} />
            )}
            <Text style={styles.hospitalText}>
              {' '}• {post.authorHospital}
            </Text>
          </View>

          <View style={styles.statsGroup}>
            {/* 추천 (좋아요 토글) */}
            <TouchableOpacity
              style={styles.statBtn}
              onPress={() => onToggleLike(post.id)}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <HeartIcon
                size={13}
                color={post.isLiked ? theme.primary : COLORS.textMuted}
              />
              <Text
                style={[
                  styles.statText,
                  post.isLiked && { color: theme.primary, fontWeight: '700' },
                ]}
              >
                {post.likes}
              </Text>
            </TouchableOpacity>

            {/* 댓글 수 */}
            <View style={styles.statBtn}>
              <CommentIcon size={13} color={COLORS.textMuted} />
              <Text style={styles.statText}>{post.commentsCount}</Text>
            </View>

            {/* 조회수 */}
            <View style={styles.statBtn}>
              <EyeIcon size={13} color={COLORS.textMuted} />
              <Text style={styles.statText}>{post.views}</Text>
            </View>

            {/* 북마크 보관함 토글 */}
            <TouchableOpacity
              style={styles.statBtn}
              onPress={() => onToggleBookmark(post.id)}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <BookmarkIcon
                size={13}
                color={post.isBookmarked ? theme.primary : COLORS.textMuted}
                filled={post.isBookmarked}
              />
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>

      <ReportModal
        visible={reportVisible}
        targetId={post.id}
        targetType="post"
        onClose={() => setReportVisible(false)}
      />
    </Card>
  );
};

const styles = StyleSheet.create({
  postCard: {
    padding: 16,
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  postTopMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  metaRightRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  moreBtn: {
    paddingHorizontal: 4,
    paddingVertical: 2,
  },
  moreBtnText: {
    fontSize: 14,
    color: COLORS.textMuted,
    fontWeight: '700',
    letterSpacing: -1,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  cardCategoryBadge: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  cardCategoryText: {
    fontSize: 13,
    color: COLORS.textSecondary,
    fontWeight: '600',
    lineHeight: 18,
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    backgroundColor: '#E0F2FE',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 6,
  },
  verifiedBadgeText: {
    fontSize: 12,
    color: '#0284C7',
    fontWeight: '700',
    lineHeight: 16,
  },
  postTimeText: {
    fontSize: 13,
    color: COLORS.textMuted,
    lineHeight: 18,
  },
  postContentRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  postTextCol: {
    flex: 1,
  },
  postCardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 6,
    lineHeight: 24,
  },
  postCardPreview: {
    fontSize: 15,
    color: COLORS.textSecondary,
    lineHeight: 22,
  },
  postThumbnail: {
    width: 68,
    height: 68,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
  },
  postFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  authorRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  authorInfoText: {
    fontSize: 13,
    color: '#191F28',
    fontWeight: '700',
    lineHeight: 18,
  },
  hospitalText: {
    fontSize: 13,
    color: COLORS.textMuted,
    fontWeight: '500',
    lineHeight: 18,
  },
  statsGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  statBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statText: {
    fontSize: 13,
    color: COLORS.textMuted,
    fontWeight: '500',
    lineHeight: 18,
  },
});

