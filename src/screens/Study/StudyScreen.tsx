import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  ActivityIndicator,
  TouchableOpacity,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppHeader } from '../../components/common/AppHeader';
import { COLORS, useAppTheme } from '../../constants/theme';
import { useTabBarHeight } from '../../hooks/useTabBarHeight';
import { SearchIcon } from '../../components/common/Icon';
import { useStudyStore } from '../../store/useStudyStore';
import { StudyGuideItem } from '../../types/study';
import { OFFICIAL_MEDICAL_CITATIONS, MEDICAL_DISCLAIMER_TEXT } from '../../constants/medicalCitations';

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
  const theme = useAppTheme();
  const tabBarHeight = useTabBarHeight();
  const { studyGuides, fetchStudyGuides, toggleBookmarkGuide, isLoadingGuides } = useStudyStore();

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
    <SafeAreaView style={styles.safeArea} edges={['left', 'right']}>
      <AppHeader />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[styles.contentContainer, { paddingBottom: tabBarHeight + 24 }]}
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
        {selectedCategory === '전체' && !searchText && studyGuides.length > 1 && studyGuides[1] && (
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
          {isLoadingGuides && filteredGuides.length === 0 ? (
            <View style={[styles.emptyBox, { paddingVertical: 36 }]}>
              <ActivityIndicator size="small" color={theme.primary} />
              <Text style={[styles.emptyText, { marginTop: 10 }]}>
                임상 지침을 불러오는 중입니다...
              </Text>
            </View>
          ) : filteredGuides.length === 0 ? (
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

        {/* 의학 정보 및 표준 지침 공식 출처 (Guideline 1.4.1 준수) */}
        <View style={styles.citationSection}>
          <Text style={styles.citationSectionTitle}>의학 정보 및 임상 지침 출처 (Medical Citations)</Text>
          <Text style={styles.disclaimerText}>{MEDICAL_DISCLAIMER_TEXT}</Text>

          <View style={styles.citationList}>
            {OFFICIAL_MEDICAL_CITATIONS.map((cit) => (
              <TouchableOpacity
                key={cit.id}
                style={styles.citationCard}
                onPress={() => Linking.openURL(cit.url)}
                activeOpacity={0.7}
              >
                <View style={styles.citationBadge}>
                  <Text style={styles.citationBadgeText}>{cit.agency}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.citationItemTitle}>{cit.title}</Text>
                  <Text style={styles.citationItemDesc}>{cit.description}</Text>
                  <Text style={styles.citationItemUrl}>{cit.url} ↗</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
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
    lineHeight: 28,
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
  citationSection: {
    backgroundColor: '#F9FAFB',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginTop: 24,
    marginBottom: 30,
  },
  citationSectionTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: COLORS.textPrimary,
    marginBottom: 6,
  },
  disclaimerText: {
    fontSize: 12,
    color: COLORS.textSecondary,
    lineHeight: 18,
    marginBottom: 12,
  },
  citationList: {
    gap: 10,
  },
  citationCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  citationBadge: {
    backgroundColor: '#EEF2FF',
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 3,
  },
  citationBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#4F46E5',
  },
  citationItemTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 2,
  },
  citationItemDesc: {
    fontSize: 11,
    color: COLORS.textMuted,
    lineHeight: 15,
    marginBottom: 4,
  },
  citationItemUrl: {
    fontSize: 11,
    fontWeight: '600',
    color: '#2563EB',
  },
});

export default StudyScreen;
