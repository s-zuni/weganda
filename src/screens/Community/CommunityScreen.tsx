import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  TextInput,
  Image,
} from 'react-native';
import { AppHeader } from '../../components/common/AppHeader';
import { Card } from '../../components/common/Card';
import { COLORS } from '../../constants/theme';
import {
  EyeIcon,
  HeartIcon,
  CommentIcon,
  PencilIcon,
  SearchIcon,
  FireIcon,
  BookmarkIcon,
  BadgeCheckIcon,
} from '../../components/common/Icon';
import { useCommunityStore } from '../../store/useCommunityStore';
import { PostItem } from '../../mocks/communityData';

// 서브 모달 컴포넌트 직접 임포트
import { PostDetailModal } from '../../components/specific/Community/PostDetailModal';
import { PostWriteModal } from '../../components/specific/Community/PostWriteModal';

export const CommunityScreen: React.FC = () => {
  const { posts, blockedUserIds, fetchPosts, toggleLikePost, toggleBookmarkPost } = useCommunityStore();

  useEffect(() => {
    // 실제 Supabase DB에서 게시글 조회
    fetchPosts();
  }, [fetchPosts]);

  const [selectedCategory, setSelectedCategory] = useState<string>('전체');
  const [searchText, setSearchText] = useState('');

  // 모달 제어 상태
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [selectedPost, setSelectedPost] = useState<PostItem | null>(null);
  const [writeModalVisible, setWriteModalVisible] = useState(false);

  // 실시간 인기글 (HOT 토픽) 동적 계산 (좋아요 순 상위 5개)
  const hotTopics = [...posts]
    .filter((p) => p.likes > 0)
    .sort((a, b) => b.likes - a.likes)
    .slice(0, 5)
    .map((p, idx) => ({
      id: p.id,
      rank: idx + 1,
      category: p.category,
      title: p.title,
      likes: p.likes,
      comments: p.commentsCount,
    }));

  // 카테고리 탭 목록 (킬러 기능: 📌 북마크 보관함 포함)
  const categories = [
    '전체',
    '임상/질문',
    '교대근무 고민',
    '이직/커리어',
    '자유게시판',
    '북마크 보관함',
  ];

  // 차단된 사용자 제외 및 카테고리/검색 필터링
  const filteredPosts = posts.filter((p) => {
    // 1. 차단된 사용자 글 숨김
    if (blockedUserIds.includes(p.authorId)) return false;

    // 2. 카테고리 필터
    if (selectedCategory === '북마크 보관함') {
      if (!p.isBookmarked) return false;
    } else if (selectedCategory !== '전체') {
      if (p.category !== selectedCategory) return false;
    }

    // 3. 검색어 필터
    if (searchText.trim()) {
      const query = searchText.toLowerCase();
      const matchTitle = p.title.toLowerCase().includes(query);
      const matchContent = p.content.toLowerCase().includes(query);
      const matchAuthor = p.authorName.toLowerCase().includes(query);
      return matchTitle || matchContent || matchAuthor;
    }

    return true;
  });

  const handleOpenDetail = (post: PostItem) => {
    setSelectedPost(post);
    setDetailModalVisible(true);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <AppHeader />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* ── 킬러 기능 1: 실시간 인기글 (HOT 토픽) 가로 스크롤 배너 ── */}
        <View style={styles.hotSection}>
          <View style={styles.hotHeaderRow}>
            <View style={styles.hotTitleGroup}>
              <FireIcon size={18} color={COLORS.primary} />
              <Text style={styles.hotSectionTitle}>실시간 간호 HOT 토픽</Text>
            </View>
            <Text style={styles.hotSectionSub}>오늘 추천수 급상승</Text>
          </View>

          {hotTopics.length === 0 ? (
            <View style={styles.hotEmptyCard}>
              <Text style={styles.hotEmptyTitle}>아직 등록된 실시간 인기글이 없어요 🔥</Text>
              <Text style={styles.hotEmptySub}>
                동료들에게 도움이 되는 임상 팁이나 교대근무 일상을 공유해보세요!
              </Text>
            </View>
          ) : (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.hotScroll}>
              {hotTopics.map((hot) => {
                const matchedPost = posts.find((p) => p.id === hot.id);
                return (
                  <TouchableOpacity
                    key={hot.id}
                    style={styles.hotCard}
                    onPress={() => matchedPost && handleOpenDetail(matchedPost)}
                    activeOpacity={0.85}
                  >
                    <View style={styles.hotCardTop}>
                      <View style={styles.rankBadge}>
                        <Text style={styles.rankBadgeText}>{hot.rank}위</Text>
                      </View>
                      <Text style={styles.hotCategoryText}>{hot.category}</Text>
                    </View>

                    <Text style={styles.hotCardTitle} numberOfLines={2}>
                      {hot.title}
                    </Text>

                    <View style={styles.hotStatsRow}>
                      <View style={styles.hotStatItem}>
                        <HeartIcon size={12} color={COLORS.primary} />
                        <Text style={styles.hotStatText}>{hot.likes}</Text>
                      </View>
                      <View style={styles.hotStatItem}>
                        <CommentIcon size={12} color={COLORS.textMuted} />
                        <Text style={styles.hotStatText}>{hot.comments}</Text>
                      </View>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          )}
        </View>

        {/* ── 검색 바 ── */}
        <View style={styles.searchRow}>
          <View style={styles.searchInputContainer}>
            <SearchIcon size={16} color={COLORS.textMuted} />
            <TextInput
              style={styles.searchInput}
              placeholder="제목, 내용, 작성자 검색"
              placeholderTextColor={COLORS.textMuted}
              value={searchText}
              onChangeText={setSearchText}
            />
          </View>
        </View>

        {/* ── 카테고리 탭 ── */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoryScroll}
        >
          {categories.map((cat) => {
            const isSelected = selectedCategory === cat;
            const isBookmarkTab = cat === '북마크 보관함';
            return (
              <TouchableOpacity
                key={cat}
                style={[
                  styles.categoryTab,
                  isSelected && styles.categoryTabActive,
                  isBookmarkTab && !isSelected && styles.categoryTabBookmark,
                ]}
                onPress={() => setSelectedCategory(cat)}
                activeOpacity={0.8}
              >
                {isBookmarkTab && (
                  <BookmarkIcon
                    size={13}
                    color={isSelected ? '#FFFFFF' : COLORS.primary}
                    filled={true}
                  />
                )}
                <Text
                  style={[
                    styles.categoryTabText,
                    isSelected && styles.categoryTabTextActive,
                    isBookmarkTab && !isSelected && { color: COLORS.primary },
                  ]}
                >
                  {cat}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* ── 게시글 피드 헤더 & 글쓰기 버튼 ── */}
        <View style={styles.feedHeaderRow}>
          <Text style={styles.feedCountText}>총 {filteredPosts.length}개의 이야기</Text>
          <TouchableOpacity
            style={styles.writeButton}
            onPress={() => setWriteModalVisible(true)}
            activeOpacity={0.85}
          >
            <PencilIcon size={14} color="#FFFFFF" />
            <Text style={styles.writeButtonText}>글쓰기</Text>
          </TouchableOpacity>
        </View>

        {/* ── 게시글 피드 리스트 ── */}
        <View style={styles.postList}>
          {filteredPosts.length === 0 ? (
            <View style={styles.emptyFeedBox}>
              <Text style={styles.emptyFeedIcon}>✍️</Text>
              <Text style={styles.emptyFeedTitle}>
                {selectedCategory === '북마크 보관함'
                  ? '보관된 글이 없어요'
                  : searchText.trim()
                  ? '일치하는 검색 결과가 없어요'
                  : '아직 등록된 이야기가 없어요'}
              </Text>
              <Text style={styles.emptyFeedText}>
                {selectedCategory === '북마크 보관함'
                  ? '유용한 임상 팁과 족보를 북마크해 언제든 꺼내보세요.'
                  : searchText.trim()
                  ? '다른 검색어로 다시 검색해보거나 새로운 글을 남겨보세요.'
                  : `${selectedCategory === '전체' ? '간호 이야기' : selectedCategory}의 첫 번째 주인공이 되어보세요!`}
              </Text>
              {selectedCategory !== '북마크 보관함' && (
                <TouchableOpacity
                  style={styles.emptyFeedBtn}
                  onPress={() => setWriteModalVisible(true)}
                  activeOpacity={0.85}
                >
                  <PencilIcon size={14} color="#FFFFFF" />
                  <Text style={styles.emptyFeedBtnText}>첫 글 작성하기</Text>
                </TouchableOpacity>
              )}
            </View>
          ) : (
            filteredPosts.map((post) => (
              <Card key={post.id} style={styles.postCard}>
                <TouchableOpacity onPress={() => handleOpenDetail(post)} activeOpacity={0.9}>
                  {/* 상단 메타 바 */}
                  <View style={styles.postTopMeta}>
                    <View style={styles.badgeRow}>
                      <View style={styles.cardCategoryBadge}>
                        <Text style={styles.cardCategoryText}>{post.category}</Text>
                      </View>
                      {/* 킬러 기능 2: 병원 인증 뱃지 */}
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
                        onPress={() => toggleLikePost(post.id)}
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
                        onPress={() => toggleBookmarkPost(post.id)}
                        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                      >
                        <BookmarkIcon
                          size={14}
                          color={post.isBookmarked ? COLORS.primary : COLORS.textMuted}
                          filled={post.isBookmarked}
                        />
                      </TouchableOpacity>
                    </View>
                  </View>
                </TouchableOpacity>
              </Card>
            ))
          )}
        </View>
      </ScrollView>

      {/* ── 게시글 상세 모달 ── */}
      <PostDetailModal
        visible={detailModalVisible}
        post={selectedPost}
        onClose={() => setDetailModalVisible(false)}
      />

      {/* ── 글쓰기 모달 ── */}
      <PostWriteModal
        visible={writeModalVisible}
        onClose={() => setWriteModalVisible(false)}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: 20,
    paddingBottom: 90,
  },

  // HOT TOPICS CAROUSEL
  hotSection: {
    marginTop: 6,
    marginBottom: 16,
  },
  hotHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  hotTitleGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  hotSectionTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  hotSectionSub: {
    fontSize: 11,
    color: COLORS.primary,
    fontWeight: '700',
  },
  hotScroll: {
    flexDirection: 'row',
    marginHorizontal: -20,
    paddingHorizontal: 20,
  },
  hotEmptyCard: {
    backgroundColor: '#FFF8FA',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#FFE4EA',
    borderStyle: 'dashed',
  },
  hotEmptyTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 4,
  },
  hotEmptySub: {
    fontSize: 12,
    color: COLORS.textSecondary,
    lineHeight: 17,
  },
  hotCard: {
    width: 210,
    backgroundColor: '#FFF1F4',
    borderRadius: 16,
    padding: 14,
    marginRight: 10,
    borderWidth: 1,
    borderColor: '#FFE4EA',
    justifyContent: 'space-between',
  },
  hotCardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  rankBadge: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  rankBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  hotCategoryText: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  hotCardTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textPrimary,
    lineHeight: 18,
    marginBottom: 10,
  },
  hotStatsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  hotStatItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  hotStatText: {
    fontSize: 11,
    color: COLORS.textSecondary,
    fontWeight: '600',
  },

  // SEARCH BAR
  searchRow: {
    marginBottom: 14,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 14,
    paddingHorizontal: 14,
    height: 44,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    color: COLORS.textPrimary,
    paddingVertical: 0,
  },

  // CATEGORY TABS
  categoryScroll: {
    gap: 8,
    paddingBottom: 14,
  },
  categoryTab: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 13,
    paddingVertical: 7,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  categoryTabActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  categoryTabBookmark: {
    backgroundColor: '#FFF1F4',
    borderColor: '#FFE4EA',
  },
  categoryTabText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  categoryTabTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },

  // FEED HEADER
  feedHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  feedCountText: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textSecondary,
  },
  writeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: COLORS.primary,
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 18,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 5,
    elevation: 3,
  },
  writeButtonText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },

  // POST LIST
  postList: {
    gap: 12,
  },
  emptyFeedBox: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 48,
    paddingHorizontal: 20,
    backgroundColor: '#F9FAFB',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderStyle: 'dashed',
    marginVertical: 10,
  },
  emptyFeedIcon: {
    fontSize: 32,
    marginBottom: 10,
  },
  emptyFeedTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 6,
    textAlign: 'center',
  },
  emptyFeedText: {
    fontSize: 13,
    color: COLORS.textMuted,
    textAlign: 'center',
    lineHeight: 19,
    marginBottom: 16,
  },
  emptyFeedBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: COLORS.primary,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  emptyFeedBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  postCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
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
    backgroundColor: '#FFF1F4',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  cardCategoryText: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.primary,
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    backgroundColor: '#F0F9FF',
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: 4,
  },
  verifiedBadgeText: {
    fontSize: 9,
    fontWeight: '700',
    color: '#0284C7',
  },
  postTimeText: {
    fontSize: 11,
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
    fontSize: 15,
    fontWeight: '800',
    color: COLORS.textPrimary,
    marginBottom: 4,
  },
  postCardPreview: {
    fontSize: 12,
    color: COLORS.textSecondary,
    lineHeight: 18,
  },
  postThumbnail: {
    width: 60,
    height: 60,
    borderRadius: 10,
    resizeMode: 'cover',
  },
  postFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    paddingTop: 10,
  },
  authorInfoText: {
    fontSize: 11,
    color: COLORS.textMuted,
    flex: 1,
  },
  statsGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  statBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  statText: {
    fontSize: 11,
    color: COLORS.textMuted,
    fontWeight: '600',
  },
});

export default CommunityScreen;
