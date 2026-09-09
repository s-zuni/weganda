import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
} from 'react-native';
import { Card } from '../../common/Card';
import { COLORS } from '../../../constants/theme';
import {
  HeartIcon,
  CommentIcon,
  EyeIcon,
  BookmarkIcon,
  BadgeCheckIcon,
} from '../../common/Icon';
import { PostItem } from '../../../types/community';

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
  return (
    <Card style={styles.postCard}>
      <TouchableOpacity onPress={() => onOpenDetail(post)} activeOpacity={0.9}>
        {/* 상단 메타 바 */}
        <View style={styles.postTopMeta}>
          <View style={styles.badgeRow}>
            <View style={styles.cardCategoryBadge}>
              <Text style={styles.cardCategoryText}>{post.category}</Text>
            </View>
            {/* 병원 인증 뱃지 */}
            {post.isVerifiedHospital && !post.isAnonymous && (
              <View style={styles.verifiedBadge}>
                <BadgeCheckIcon size={12} color="#0284C7" />
                <Text style={styles.verifiedBadgeText}>병원인증</Text>
              </View>
            )}
          </View>

          <Text style={styles.postTimeText}>{post.timeAgo}</Text>
        </View>

        {/* 제목 & 본문 프리뷰 */}
        <View style={styles.postContentRow}>
          <View style={styles.postTextCol}>
            <Text style={styles.postCardTitle} numberOfLines={1}>
              {post.title}
            </Text>
            <Text style={styles.postCardPreview} numberOfLines={2}>
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
          <Text style={styles.authorInfoText}>
            {post.authorName} • {post.authorHospital}
          </Text>

          <View style={styles.statsGroup}>
            {/* 추천 (좋아요 토글) */}
            <TouchableOpacity
              style={styles.statBtn}
              onPress={() => onToggleLike(post.id)}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <HeartIcon
                size={13}
                color={post.isLiked ? COLORS.primary : COLORS.textMuted}
              />
              <Text
                style={[
                  styles.statText,
                  post.isLiked && { color: COLORS.primary, fontWeight: '700' },
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
                color={post.isBookmarked ? COLORS.primary : COLORS.textMuted}
                filled={post.isBookmarked}
              />
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
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
  },
  postTimeText: {
    fontSize: 13,
    color: COLORS.textMuted,
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
  authorInfoText: {
    fontSize: 13,
    color: COLORS.textMuted,
    fontWeight: '500',
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
  },
});

