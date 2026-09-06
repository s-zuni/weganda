import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  TextInput,
} from 'react-native';
import { AppHeader } from '../../components/common/AppHeader';
import { Card } from '../../components/common/Card';
import { COLORS } from '../../constants/theme';
import {
  SearchIcon,
  BookmarkIcon,
  BotIcon,
  CalculatorIcon,
  FlaskIcon,
  ZapIcon,
  BookOpenIcon,
  ActivityIcon,
} from '../../components/common/Icon';
import { useStudyStore } from '../../store/useStudyStore';
import { StudyGuideItem } from '../../mocks/studyData';

// 서브 모달 컴포넌트 직접 임포트
import { DrugCalculatorModal } from '../../components/specific/Study/DrugCalculatorModal';
import { StudyDetailModal } from '../../components/specific/Study/StudyDetailModal';
import { AskAiModal } from '../../components/specific/Study/AskAiModal';

export const StudyScreen: React.FC = () => {
  const { studyGuides, toggleBookmarkGuide } = useStudyStore();

  const [selectedCategory, setSelectedCategory] = useState<string>('전체');
  const [searchText, setSearchText] = useState('');

  // 모달 제어 상태
  const [calcModalVisible, setCalcModalVisible] = useState(false);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [selectedGuide, setSelectedGuide] = useState<StudyGuideItem | null>(null);
  const [aiModalVisible, setAiModalVisible] = useState(false);

  const categories = [
    '전체',
    '약물계산/투약',
    '응급/ACLS',
    '간호술기',
    '바이탈/중재',
    '북마크 보관함',
  ];

  // 필터링 로직
  const filteredGuides = studyGuides.filter((guide) => {
    // 1. 카테고리 필터
    if (selectedCategory === '북마크 보관함') {
      if (!guide.isBookmarked) return false;
    } else if (selectedCategory !== '전체') {
      if (guide.category !== selectedCategory) return false;
    }

    // 2. 검색어 필터
    if (searchText.trim()) {
      const q = searchText.toLowerCase();
      return (
        guide.title.toLowerCase().includes(q) ||
        guide.summary.toLowerCase().includes(q) ||
        guide.category.toLowerCase().includes(q)
      );
    }

    return true;
  });

  const handleOpenDetail = (guide: StudyGuideItem) => {
    setSelectedGuide(guide);
    setDetailModalVisible(true);
  };

  const renderIcon = (type: StudyGuideItem['iconType'], color = COLORS.primary) => {
    switch (type) {
      case 'flask':
        return <FlaskIcon size={20} color={color} />;
      case 'zap':
        return <ZapIcon size={20} color="#F59E0B" />;
      case 'activity':
        return <ActivityIcon size={20} color="#E11D48" />;
      default:
        return <BookOpenIcon size={20} color="#4F98CA" />;
    }
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
        {/* ── 1. 상단 AI 질문 배너 ── */}
        <TouchableOpacity
          style={styles.askAiBanner}
          onPress={() => setAiModalVisible(true)}
          activeOpacity={0.85}
        >
          <View style={styles.askAiLeft}>
            <View style={styles.aiIconCircle}>
              <BotIcon size={20} color={COLORS.primary} />
            </View>
            <View>
              <Text style={styles.askAiTitle}>간호 임상 지식을 AI에게 물어보세요</Text>
              <Text style={styles.askAiSub}>약물 투약법, ACLS 프로토콜, SBAR 실시간 답변 ›</Text>
            </View>
          </View>
        </TouchableOpacity>

        {/* ── 2. 임상 도구: 약물 gtt 계산기 퀵 진입 카드 ── */}
        <TouchableOpacity
          style={styles.calcCard}
          onPress={() => setCalcModalVisible(true)}
          activeOpacity={0.85}
        >
          <View style={styles.calcCardLeft}>
            <View style={styles.calcIconWrapper}>
              <CalculatorIcon size={22} color="#FFFFFF" />
            </View>
            <View style={styles.calcTexts}>
              <Text style={styles.calcTitle}>임상 약물 gtt / cc 점적 계산기</Text>
              <Text style={styles.calcSub}>도파민, 승압제 처방 용량(mcg) ↔ 주입 속도 환산</Text>
            </View>
          </View>
          <View style={styles.calcGoBadge}>
            <Text style={styles.calcGoText}>계산하기 ›</Text>
          </View>
        </TouchableOpacity>

        {/* ── 3. 검색 바 ── */}
        <View style={styles.searchRow}>
          <View style={styles.searchInputContainer}>
            <SearchIcon size={16} color={COLORS.textMuted} />
            <TextInput
              style={styles.searchInput}
              placeholder="임상 술기, 약물 계산, 지침서 검색"
              placeholderTextColor={COLORS.textMuted}
              value={searchText}
              onChangeText={setSearchText}
            />
          </View>
        </View>

        {/* ── 4. 카테고리 탭 ── */}
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

        {/* ── 5. 오늘의 추천 학습 카드 ── */}
        {selectedCategory === '전체' && !searchText && (
          <TouchableOpacity
            style={styles.featuredSection}
            onPress={() => handleOpenDetail(studyGuides[1])}
            activeOpacity={0.9}
          >
            <View style={styles.featuredHeader}>
              <View style={styles.newBadge}>
                <Text style={styles.newBadgeText}>PICK</Text>
              </View>
              <Text style={styles.featuredSub}>오늘의 추천 학습 프로토콜</Text>
            </View>

            <Text style={styles.featuredHeading}>
              한국형 전문심장소생술 (K-ACLS) 퀵 레퍼런스
            </Text>
            <Text style={styles.featuredDesc}>
              제세동 가능 리듬(VF/pVT)과 불가능 리듬(PEA/Asystole) 에피네프린 투여 타이밍 완벽 가이드
            </Text>
          </TouchableOpacity>
        )}

        {/* ── 6. 프로토콜 리스트 ── */}
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>
            임상 지침 & 술기 족보 ({filteredGuides.length})
          </Text>
        </View>

        <View style={styles.guideList}>
          {filteredGuides.length === 0 ? (
            <View style={styles.emptyBox}>
              <Text style={styles.emptyText}>
                {selectedCategory === '북마크 보관함'
                  ? '북마크한 임상 족보가 없습니다.\n자주 찾아보는 지침을 저장해 두세요!'
                  : '해당 카테고리의 학습 지침서가 없습니다.'}
              </Text>
            </View>
          ) : (
            filteredGuides.map((guide) => (
              <Card key={guide.id} style={styles.guideCard}>
                <TouchableOpacity
                  style={styles.guideCardInner}
                  onPress={() => handleOpenDetail(guide)}
                  activeOpacity={0.85}
                >
                  <View style={[styles.guideIconWrapper, { backgroundColor: guide.iconBg }]}>
                    {renderIcon(guide.iconType)}
                  </View>

                  <View style={styles.guideTexts}>
                    <View style={styles.guideTopMeta}>
                      <View style={styles.miniCategoryBadge}>
                        <Text style={styles.miniCategoryText}>{guide.category}</Text>
                      </View>
                      <Text style={styles.guideMeta}>{guide.meta}</Text>
                    </View>

                    <Text style={styles.guideTitle} numberOfLines={1}>
                      {guide.title}
                    </Text>
                    <Text style={styles.guideSummary} numberOfLines={2}>
                      {guide.summary}
                    </Text>
                  </View>

                  {/* 북마크 토글 버튼 */}
                  <TouchableOpacity
                    style={styles.bookmarkBtn}
                    onPress={() => toggleBookmarkGuide(guide.id)}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  >
                    <BookmarkIcon
                      size={18}
                      color={guide.isBookmarked ? COLORS.primary : COLORS.textMuted}
                      filled={guide.isBookmarked}
                    />
                  </TouchableOpacity>
                </TouchableOpacity>
              </Card>
            ))
          )}
        </View>
      </ScrollView>

      {/* ── 3대 서브 모달들 ── */}
      <DrugCalculatorModal
        visible={calcModalVisible}
        onClose={() => setCalcModalVisible(false)}
      />

      <StudyDetailModal
        visible={detailModalVisible}
        guide={selectedGuide}
        onClose={() => setDetailModalVisible(false)}
      />

      <AskAiModal
        visible={aiModalVisible}
        onClose={() => setAiModalVisible(false)}
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

  // ASK AI BANNER
  askAiBanner: {
    backgroundColor: '#FFF1F4',
    borderRadius: 16,
    padding: 14,
    marginTop: 6,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#FFE4EA',
  },
  askAiLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  aiIconCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  askAiTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  askAiSub: {
    fontSize: 11,
    color: COLORS.primary,
    fontWeight: '600',
    marginTop: 2,
  },

  // DRUG CALCULATOR CARD
  calcCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.primary,
    borderRadius: 18,
    padding: 16,
    marginBottom: 16,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 4,
  },
  calcCardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  calcIconWrapper: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  calcTexts: {
    flex: 1,
  },
  calcTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  calcSub: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.85)',
    marginTop: 2,
  },
  calcGoBadge: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
  },
  calcGoText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.primary,
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

  // FEATURED SECTION
  featuredSection: {
    backgroundColor: '#F9FAFB',
    borderRadius: 18,
    padding: 16,
    marginBottom: 18,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  featuredHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  newBadge: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  newBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  featuredSub: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.primary,
  },
  featuredHeading: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.textPrimary,
    marginBottom: 4,
  },
  featuredDesc: {
    fontSize: 12,
    color: COLORS.textSecondary,
    lineHeight: 18,
  },

  // SECTION HEADER
  sectionHeaderRow: {
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },

  // GUIDE LIST
  guideList: {
    gap: 12,
  },
  emptyBox: {
    alignItems: 'center',
    paddingVertical: 36,
  },
  emptyText: {
    fontSize: 13,
    color: COLORS.textMuted,
    textAlign: 'center',
    lineHeight: 20,
  },
  guideCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  guideCardInner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  guideIconWrapper: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  guideTexts: {
    flex: 1,
  },
  guideTopMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 2,
  },
  miniCategoryBadge: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 4,
  },
  miniCategoryText: {
    fontSize: 10,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  guideMeta: {
    fontSize: 11,
    color: COLORS.textMuted,
  },
  guideTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 2,
  },
  guideSummary: {
    fontSize: 11,
    color: COLORS.textSecondary,
    lineHeight: 16,
  },
  bookmarkBtn: {
    padding: 4,
  },
});

export default StudyScreen;
