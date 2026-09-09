import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { COLORS } from '../../../constants/theme';
import { BotIcon, SearchIcon } from '../../common/Icon';

interface StudyAiSearchBarProps {
  onSearch: (question: string) => void;
}

const AI_SUGGESTION_TAGS = [
  { label: '💊 도파민 gtt 계산', query: '도파민 gtt 점적 계산 공식 알려줘' },
  { label: '⚡ K-ACLS 프로토콜', query: 'K-ACLS 심폐소생술 핵심 프로토콜과 약물 타이밍' },
  { label: '🩸 수혈 간호 5R', query: '수혈 간호 핵심 5R과 부작용 대처법' },
  { label: '📋 SBAR 인수인계', query: 'SBAR 임상 의사소통 및 인수인계 작성 요령' },
  { label: '🧪 ABGA 판독', query: 'ABGA 동맥혈가스분석 단계별 판독법' },
];

export const StudyAiSearchBar: React.FC<StudyAiSearchBarProps> = ({ onSearch }) => {
  const [query, setQuery] = useState('');

  const handleSearch = (textToSearch?: string) => {
    const q = (textToSearch !== undefined ? textToSearch : query).trim();
    if (!q) {
      onSearch('');
      return;
    }
    onSearch(q);
    setQuery('');
  };

  return (
    <View style={styles.container}>
      {/* 타이틀 및 뱃지 */}
      <View style={styles.titleRow}>
        <View style={styles.titleLeft}>
          <BotIcon size={18} color={COLORS.primary} />
          <Text style={styles.titleText}>임상 지식 AI 검색</Text>
        </View>
        <View style={styles.aiBadge}>
          <Text style={styles.aiBadgeText}>OpenAI 실시간 답변 🩺</Text>
        </View>
      </View>

      {/* 검색창 인풋 바 */}
      <View style={styles.searchBar}>
        <SearchIcon size={18} color={COLORS.primary} />
        <TextInput
          style={styles.input}
          placeholder="약물 계산, 응급 지침, 술기를 AI에게 검색해보세요..."
          placeholderTextColor={COLORS.textMuted}
          value={query}
          onChangeText={setQuery}
          onSubmitEditing={() => handleSearch()}
          returnKeyType="search"
          clearButtonMode="while-editing"
        />
        <TouchableOpacity
          style={[styles.searchBtn, query.trim().length > 0 && styles.searchBtnActive]}
          onPress={() => handleSearch()}
          activeOpacity={0.8}
        >
          <Text style={styles.searchBtnText}>AI 질문</Text>
        </TouchableOpacity>
      </View>

      {/* 추천 질문 태그 칩 바 */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.tagScroll}
      >
        {AI_SUGGESTION_TAGS.map((tag, idx) => (
          <TouchableOpacity
            key={idx}
            style={styles.tagChip}
            onPress={() => handleSearch(tag.query)}
            activeOpacity={0.7}
          >
            <Text style={styles.tagChipText}>{tag.label}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    marginTop: 4,
    marginBottom: 14,
    borderWidth: 1.5,
    borderColor: '#FFE4EA',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 3,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  titleLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  titleText: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.textPrimary,
    letterSpacing: -0.3,
  },
  aiBadge: {
    backgroundColor: '#FFF1F4',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  aiBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.primary,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 14,
    paddingHorizontal: 14,
    height: 52,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    gap: 10,
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: COLORS.textPrimary,
    paddingVertical: 0,
    fontWeight: '500',
  },
  searchBtn: {
    backgroundColor: '#E5E7EB',
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 10,
  },
  searchBtnActive: {
    backgroundColor: COLORS.primary,
  },
  searchBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  tagScroll: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 12,
    paddingRight: 4,
  },
  tagChip: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  tagChipText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
});

export default StudyAiSearchBar;

