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
  Alert,
  ActivityIndicator,
} from 'react-native';
import { AppHeader } from '../../components/common/AppHeader';
import { COLORS } from '../../constants/theme';
import { PencilIcon, SearchIcon } from '../../components/common/Icon';
import { useCommunityStore } from '../../store/useCommunityStore';
import { useUserStore } from '../../store/useUserStore';
import { PostItem, HotTopic, PostCategory } from '../../types/community';
import { VerificationModal } from '../../components/specific/Verification';

// 분리된 서브 컴포넌트 및 모달
import {
  PostDetailModal,
  PostWriteModal,
  HotTopicsBanner,
  CategoryFilterTabs,
  PostCardItem,
} from '../../components/specific/Community';

export const CommunityScreen: React.FC = () => {
  const {
    id: userId,
    role,
    verificationStatus,
    verificationRole,
  } = useUserStore();
  const { posts, blockedUserIds, fetchPosts, toggleLikePost, toggleBookmarkPost, isLoading } = useCommunityStore();

  useEffect(() => {
    fetchPosts(undefined, userId || undefined);
  }, [fetchPosts, userId]);

  const [selectedCategory, setSelectedCategory] = useState<string>('전체');
  const [searchText, setSearchText] = useState('');

  // 모달 제어 상태
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [selectedPost, setSelectedPost] = useState<PostItem | null>(null);
  const [writeModalVisible, setWriteModalVisible] = useState(false);
  const [verificationModalVisible, setVerificationModalVisible] = useState(false);

  // 사용자 권한 계산
  const isVerified =
    verificationStatus === 'verified' || role === 'admin' || role === 'nurse';
  const effectiveRole = role === 'admin' ? 'admin' : (verificationRole || role);
  const isStudent = effectiveRole === 'student';

  const NURSE_ONLY_CATEGORIES: PostCategory[] = ['임상/질문', '교대근무 고민', '이직/커리어'];

  // 카테고리 탭 목록 (간호학생은 전문 라운지 우선 및 간호사 전용 제외)
  const categories = isStudent
    ? ['전체', '간호대생 라운지', '채용/취업 정보', '자유게시판', '북마크 보관함']
    : [
        '전체',
        '간호대생 라운지',
        '채용/취업 정보',
        '임상/질문',
        '교대근무 고민',
        '이직/커리어',
        '자유게시판',
        '북마크 보관함',
      ];

  // 실시간 인기글 (HOT 토픽) 동적 계산 (간호학생인 경우 간호사 전용 토픽 제외)
  const visiblePostsForTopics = isStudent
    ? posts.filter((p) => !NURSE_ONLY_CATEGORIES.includes(p.category))
    : posts;

  const hotTopics: HotTopic[] = [...visiblePostsForTopics]
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

  // 차단된 사용자 제외 및 카테고리/검색 필터링
  const filteredPosts = posts.filter((p) => {
    if (blockedUserIds.includes(p.authorId)) return false;

    // 간호학생은 간호사 전용 글 열람 불가 (학생 전문 커뮤니티 + 채용/자유게시판만 가능)
    if (isStudent && NURSE_ONLY_CATEGORIES.includes(p.category)) {
      return false;
    }

    if (selectedCategory === '북마크 보관함') {
      if (!p.isBookmarked) return false;
    } else if (selectedCategory !== '전체') {
      if (p.category !== selectedCategory) return false;
    }

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

  const handlePressWrite = () => {
    if (!isVerified) {
      Alert.alert(
        '간호 인증 필요',
        '커뮤니티 글을 작성하시려면 간호사 또는 간호대학생 인증이 필요합니다.',
        [
          { text: '닫기', style: 'cancel' },
          {
            text: '인증 신청하기',
            onPress: () => setVerificationModalVisible(true),
          },
        ]
      );
      return;
    }
    setWriteModalVisible(true);
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
        {/* 미인증 사용자 유도 배너 */}
        {!isVerified && (
          <TouchableOpacity
            style={styles.verificationBanner}
            onPress={() => setVerificationModalVisible(true)}
            activeOpacity={0.85}
          >
            <View style={styles.verificationBannerLeft}>
              <Text style={styles.verificationBannerIcon}>🔒</Text>
              <View style={styles.verificationBannerTextBox}>
                <Text style={styles.verificationBannerTitle}>
                  간호 전문직 및 간호학생 인증 필요
                </Text>
                <Text style={styles.verificationBannerSub}>
                  서류 인증 후 모든 게시판 글쓰기 및 댓글이 가능합니다.
                </Text>
              </View>
            </View>
            <View style={styles.verificationBannerBadge}>
              <Text style={styles.verificationBannerBadgeText}>인증하기 &gt;</Text>
            </View>
          </TouchableOpacity>
        )}

        {/* 실시간 인기글 (HOT 토픽) 가로 스크롤 배너 */}
        <HotTopicsBanner
          hotTopics={hotTopics}
          posts={posts}
          onOpenDetail={handleOpenDetail}
        />

        {/* 검색 바 */}
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

        {/* 카테고리 탭 */}
        <CategoryFilterTabs
          categories={categories}
          selectedCategory={selectedCategory}
          onSelectCategory={setSelectedCategory}
        />

        {/* 게시글 피드 헤더 & 글쓰기 버튼 */}
        <View style={styles.feedHeaderRow}>
          <Text style={styles.feedCountText}>총 {filteredPosts.length}개의 이야기</Text>
          <TouchableOpacity
            style={styles.writeButton}
            onPress={handlePressWrite}
            activeOpacity={0.85}
          >
            <PencilIcon size={14} color="#FFFFFF" />
            <Text style={styles.writeButtonText}>글쓰기</Text>
          </TouchableOpacity>
        </View>

        {/* 게시글 피드 리스트 */}
        <View style={styles.postList}>
          {isLoading && posts.length === 0 ? (
            <View style={{ paddingVertical: 48, alignItems: 'center' }}>
              <ActivityIndicator color={COLORS.primary} size="large" />
              <Text style={{ marginTop: 12, color: COLORS.textMuted, fontSize: 14 }}>게시글을 불러오는 중입니다...</Text>
            </View>
          ) : filteredPosts.length === 0 ? (
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
                  onPress={handlePressWrite}
                  activeOpacity={0.85}
                >
                  <PencilIcon size={14} color="#FFFFFF" />
                  <Text style={styles.emptyFeedBtnText}>첫 글 작성하기</Text>
                </TouchableOpacity>
              )}
            </View>
          ) : (
            filteredPosts.map((post) => (
              <PostCardItem
                key={post.id}
                post={post}
                onOpenDetail={handleOpenDetail}
                onToggleLike={(postId) => toggleLikePost(postId, userId || undefined)}
                onToggleBookmark={(postId) => toggleBookmarkPost(postId, userId || undefined)}
              />
            ))
          )}
        </View>
      </ScrollView>

      {/* 게시글 상세 & 댓글 모달 */}
      <PostDetailModal
        visible={detailModalVisible}
        post={selectedPost}
        onClose={() => setDetailModalVisible(false)}
      />

      {/* 새 게시글 작성 모달 */}
      <PostWriteModal
        visible={writeModalVisible}
        onClose={() => setWriteModalVisible(false)}
      />

      {/* 간호사 & 학생 자격 인증 모달 */}
      <VerificationModal
        visible={verificationModalVisible}
        onClose={() => setVerificationModalVisible(false)}
        onSuccess={() => setVerificationModalVisible(false)}
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
  searchRow: {
    marginBottom: 16,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 14,
    paddingHorizontal: 14,
    height: 46,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: COLORS.textPrimary,
    paddingVertical: 0,
  },
  feedHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  feedCountText: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.textMuted,
  },
  writeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: COLORS.primary,
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: 20,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 3,
  },
  writeButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  postList: {
    gap: 12,
  },
  emptyFeedBox: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 48,
    paddingHorizontal: 24,
    backgroundColor: '#F9FAFB',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderStyle: 'dashed',
    marginVertical: 14,
  },
  emptyFeedIcon: {
    fontSize: 36,
    marginBottom: 12,
  },
  emptyFeedTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 6,
    textAlign: 'center',
  },
  emptyFeedText: {
    fontSize: 15,
    color: COLORS.textMuted,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 18,
  },
  emptyFeedBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: COLORS.primary,
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 20,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  emptyFeedBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  verificationBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFF1F4',
    borderWidth: 1,
    borderColor: '#FFE4EA',
    borderRadius: 16,
    padding: 14,
    marginBottom: 16,
  },
  verificationBannerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  verificationBannerIcon: {
    fontSize: 22,
  },
  verificationBannerTextBox: {
    flex: 1,
  },
  verificationBannerTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.primary,
    marginBottom: 2,
  },
  verificationBannerSub: {
    fontSize: 12,
    color: '#6B7280',
    lineHeight: 16,
  },
  verificationBannerBadge: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    marginLeft: 8,
  },
  verificationBannerBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});

export default CommunityScreen;
