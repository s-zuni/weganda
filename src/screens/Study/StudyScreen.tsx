import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  StatusBar,
  TextInput,
} from 'react-native';
import { AppHeader } from '../../components/common/AppHeader';
import { COLORS } from '../../constants/theme';
import { SearchIcon } from '../../components/common/Icon';
import { useStudyStore } from '../../store/useStudyStore';
import { StudyGuideItem } from '../../types/study';

// 분리된 서브 컴포넌트 및 모달
import {
  DrugCalculatorModal,
  StudyDetailModal,
  AskAiModal,
  StudyAiSearchBar,
  StudyDrugCalcBanner,
  StudyCategoryTabs,
  StudyFeaturedCard,
  StudyGuideCard,
} from '../../components/specific/Study';

export const StudyScreen: React.FC = () => {
  const { studyGuides, fetchStudyGuides, toggleBookmarkGuide } = useStudyStore();

  React.useEffect(() => {
    fetchStudyGuides();
  }, [fetchStudyGuides]);

  const [selectedCategory, setSelectedCategory] = useState<string>('전체');
  const [searchText, setSearchText] = useState('');

  // 모달 제어 상태
  const [calcModalVisible, setCalcModalVisible] = useState(false);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [selectedGuide, setSelectedGuide] = useState<StudyGuideItem | null>(null);
  const [aiModalVisible, setAiModalVisible] = useState(false);
  const [aiInitialQuestion, setAiInitialQuestion] = useState('');

  const categories = [
    '전체',
    '약물계산/투약',
    '응급/ACLS',
    '간호술기',
    '바이탈/중재',
    '북마크 보관함',
  ];

  // 필터링 로직 (DB 카테고리와 UI 탭 유연 매칭)
  const filteredGuides = studyGuides.filter((guide) => {
    if (selectedCategory === '북마크 보관함') {
      if (!guide.isBookmarked) return false;
    } else if (selectedCategory === '약물계산/투약') {
      if (guide.category !== '약물계산/투약' && (guide.category as string) !== '약물 계산') return false;
    } else if (selectedCategory === '응급/ACLS') {
      if (guide.category !== '응급/ACLS' && (guide.category as string) !== '응급 간호') return false;
    } else if (selectedCategory === '간호술기') {
      if (guide.category !== '간호술기' && (guide.category as string) !== '임상 술기') return false;
    } else if (selectedCategory === '바이탈/중재') {
      if (
        guide.category !== '바이탈/중재' &&
        (guide.category as string) !== '검사/수치' &&
        (guide.category as string) !== 'EKG'
      )
        return false;
    } else if (selectedCategory !== '전체') {
      if (guide.category !== selectedCategory) return false;
    }

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

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <AppHeader />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* 상단 AI 임상 검색창 (검색창 형식 AI 질문 인터페이스) */}
        <StudyAiSearchBar
          onSearch={(q) => {
            setAiInitialQuestion(q);
            setAiModalVisible(true);
          }}
        />

        {/* 임상 도구: 약물 gtt 계산기 퀵 진입 카드 */}
        <StudyDrugCalcBanner onPress={() => setCalcModalVisible(true)} />

        {/* 검색 바 */}
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

        {/* 카테고리 탭 */}
        <StudyCategoryTabs
          categories={categories}
          selectedCategory={selectedCategory}
          onSelectCategory={setSelectedCategory}
        />

        {/* 오늘의 추천 학습 카드 */}
        {selectedCategory === '전체' && !searchText && (
          <StudyFeaturedCard
            guide={studyGuides[1]}
            onPress={() => handleOpenDetail(studyGuides[1])}
          />
        )}

        {/* 프로토콜 리스트 */}
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
              <StudyGuideCard
                key={guide.id}
                guide={guide}
                onOpenDetail={handleOpenDetail}
                onToggleBookmark={toggleBookmarkGuide}
              />
            ))
          )}
        </View>
      </ScrollView>

      {/* 3대 서브 모달들 */}
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
        onClose={() => {
          setAiModalVisible(false);
          setAiInitialQuestion('');
        }}
        initialQuestion={aiInitialQuestion}
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
  sectionHeaderRow: {
    marginBottom: 14,
    marginTop: 4,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  guideList: {
    gap: 12,
  },
  emptyBox: {
    padding: 32,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  emptyText: {
    fontSize: 13,
    color: COLORS.textMuted,
    textAlign: 'center',
    lineHeight: 20,
  },
});

export default StudyScreen;
